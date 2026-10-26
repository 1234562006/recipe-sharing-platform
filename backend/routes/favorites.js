const express = require('express');
const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get all favorite recipes for the authenticated user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'recipe',
        populate: {
          path: 'author',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out any favorites where the underlying recipe was deleted
    const validFavorites = favorites.filter((fav) => fav.recipe !== null);

    return res.status(200).json({
      success: true,
      count: validFavorites.length,
      favorites: validFavorites,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/favorites/:recipeId
// @desc    Add a recipe to user's favorites
// @access  Private
router.post('/:recipeId', protect, async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.isValidObjectId(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format.',
      });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: req.user._id,
      recipe: recipeId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Recipe is already in your favorites.',
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      recipe: recipeId,
    });

    return res.status(201).json({
      success: true,
      message: 'Recipe added to your favorites!',
      favorite,
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/favorites/:recipeId
// @desc    Remove a recipe from user's favorites
// @access  Private
router.delete('/:recipeId', protect, async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.isValidObjectId(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format.',
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      recipe: recipeId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found for this recipe.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recipe removed from your favorites.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
