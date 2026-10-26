const express = require('express');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/me/recipes
// @desc    Get all recipes published by the authenticated user
// @access  Private
router.get('/me/recipes', protect, async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
