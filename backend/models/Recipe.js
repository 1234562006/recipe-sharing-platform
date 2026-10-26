const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    ingredients: {
      type: [String],
      required: [true, 'At least one ingredient is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.some(i => i && i.trim().length > 0);
        },
        message: 'A recipe must have at least one valid ingredient',
      },
    },
    instructions: {
      type: [String],
      required: [true, 'At least one instruction step is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.some(s => s && s.trim().length > 0);
        },
        message: 'A recipe must have at least one instruction step',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: [
          'Breakfast',
          'Lunch',
          'Dinner',
          'Snacks',
          'Desserts',
          'Vegetarian',
          'Beverages',
          'Other',
        ],
        message: '{VALUE} is not a supported category',
      },
    },
    prepTime: {
      type: Number,
      required: [true, 'Prep time is required'],
      min: [0, 'Prep time cannot be negative'],
      default: 0,
    },
    cookTime: {
      type: Number,
      required: [true, 'Cook time is required'],
      min: [0, 'Cook time cannot be negative'],
      default: 0,
    },
    servings: {
      type: Number,
      required: [true, 'Servings are required'],
      min: [1, 'Servings must be at least 1'],
      default: 2,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
      default: 'Easy',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    dietaryTags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipe author is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total time
recipeSchema.virtual('totalTime').get(function () {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

// Text indexing for fast search
recipeSchema.index({ title: 'text', description: 'text', category: 'text' });
recipeSchema.index({ author: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ difficulty: 1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
