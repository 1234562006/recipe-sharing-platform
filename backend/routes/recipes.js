const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper to normalize array input (accepts array of strings, or comma/newline delimited text)
const parseStringArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => (typeof item === 'string' ? item.trim() : String(item).trim())).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// @route   GET /api/recipes
// @desc    Get all recipes with search, filtering, and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search,
      category,
      difficulty,
      maxTime,
      dietaryTag,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = { $regex: new RegExp(`^${difficulty.trim()}$`, 'i') };
    }

    // Dietary tag filter
    if (dietaryTag && dietaryTag !== 'All') {
      query.dietaryTags = { $in: [new RegExp(`^${dietaryTag.trim()}$`, 'i')] };
    }

    // Max total cooking/prep time filter
    if (maxTime && !isNaN(Number(maxTime))) {
      const parsedMaxTime = Number(maxTime);
      query.$expr = {
        $lte: [{ $add: ['$prepTime', '$cookTime'] }, parsedMaxTime],
      };
    }

    // Text search in title, description, or ingredients
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { ingredients: searchRegex },
        { dietaryTags: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'prepTimeAsc') {
      sortOption = { prepTime: 1 };
    } else if (sort === 'cookTimeAsc') {
      sortOption = { cookTime: 1 };
    } else if (sort === 'titleAsc') {
      sortOption = { title: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .populate('author', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // If user is logged in, attach isFavorited status
    if (req.user && recipes.length > 0) {
      const recipeIds = recipes.map((r) => r._id);
      const userFavorites = await Favorite.find({
        user: req.user._id,
        recipe: { $in: recipeIds },
      }).select('recipe');

      const favoritedSet = new Set(
        userFavorites.map((f) => f.recipe.toString())
      );

      recipes.forEach((r) => {
        r.isFavorited = favoritedSet.has(r._id.toString());
      });
    }

    return res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      recipes,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format.',
      });
    }

    const recipe = await Recipe.findById(id).populate('author', 'name email createdAt');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    let isFavorited = false;
    let isAuthor = false;

    if (req.user) {
      const fav = await Favorite.findOne({
        user: req.user._id,
        recipe: recipe._id,
      });
      isFavorited = !!fav;
      isAuthor = recipe.author && recipe.author._id.toString() === req.user._id.toString();
    }

    return res.status(200).json({
      success: true,
      recipe,
      isFavorited,
      isAuthor,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      imageUrl,
      dietaryTags,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipe title is required.',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipe category is required.',
      });
    }

    const parsedIngredients = parseStringArray(ingredients);
    if (parsedIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one ingredient.',
      });
    }

    const parsedInstructions = parseStringArray(instructions);
    if (parsedInstructions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one cooking instruction step.',
      });
    }

    const parsedPrepTime = Number(prepTime);
    if (isNaN(parsedPrepTime) || parsedPrepTime < 0) {
      return res.status(400).json({
        success: false,
        message: 'Prep time must be a positive number of minutes.',
      });
    }

    const parsedCookTime = Number(cookTime);
    if (isNaN(parsedCookTime) || parsedCookTime < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cook time must be a positive number of minutes.',
      });
    }

    const parsedServings = Number(servings);
    if (isNaN(parsedServings) || parsedServings < 1) {
      return res.status(400).json({
        success: false,
        message: 'Servings must be at least 1.',
      });
    }

    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be Easy, Medium, or Hard.',
      });
    }

    const recipe = await Recipe.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      category: category.trim(),
      prepTime: parsedPrepTime,
      cookTime: parsedCookTime,
      servings: parsedServings,
      difficulty: difficulty || 'Easy',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      dietaryTags: parseStringArray(dietaryTags),
      author: req.user._id,
    });

    await recipe.populate('author', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Recipe published successfully!',
      recipe,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private (Author only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format.',
      });
    }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    // Ownership check
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to edit this recipe.',
      });
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      prepTime,
      cookTime,
      servings,
      difficulty,
      imageUrl,
      dietaryTags,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Recipe title cannot be empty.',
        });
      }
      recipe.title = title.trim();
    }

    if (description !== undefined) recipe.description = description.trim();

    if (ingredients !== undefined) {
      const parsed = parseStringArray(ingredients);
      if (parsed.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one ingredient.',
        });
      }
      recipe.ingredients = parsed;
    }

    if (instructions !== undefined) {
      const parsed = parseStringArray(instructions);
      if (parsed.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one instruction step.',
        });
      }
      recipe.instructions = parsed;
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be empty.',
        });
      }
      recipe.category = category.trim();
    }

    if (prepTime !== undefined) {
      const num = Number(prepTime);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({
          success: false,
          message: 'Prep time must be a non-negative number.',
        });
      }
      recipe.prepTime = num;
    }

    if (cookTime !== undefined) {
      const num = Number(cookTime);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cook time must be a non-negative number.',
        });
      }
      recipe.cookTime = num;
    }

    if (servings !== undefined) {
      const num = Number(servings);
      if (isNaN(num) || num < 1) {
        return res.status(400).json({
          success: false,
          message: 'Servings must be at least 1.',
        });
      }
      recipe.servings = num;
    }

    if (difficulty !== undefined) {
      const valid = ['Easy', 'Medium', 'Hard'];
      if (!valid.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: 'Difficulty must be Easy, Medium, or Hard.',
        });
      }
      recipe.difficulty = difficulty;
    }

    if (imageUrl !== undefined) recipe.imageUrl = imageUrl.trim();
    if (dietaryTags !== undefined) recipe.dietaryTags = parseStringArray(dietaryTags);

    const updatedRecipe = await recipe.save();
    await updatedRecipe.populate('author', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Recipe updated successfully!',
      recipe: updatedRecipe,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private (Author only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format.',
      });
    }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    // Ownership check
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to delete this recipe.',
      });
    }

    // Delete recipe and its associated favorites
    await Recipe.findByIdAndDelete(id);
    await Favorite.deleteMany({ recipe: id });

    return res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
