const Recipe = require('../models/Recipe');
const User = require('../models/User');

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe({ ...req.body, createdBy: req.user });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.filterRecipes = async (req, res) => {
  try {
    const { cuisine, dietType } = req.query;
    let filter = {};
    if (cuisine) filter.cuisine = cuisine;
    if (dietType) filter.dietType = dietType;

    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const recipeId = req.params.id;

    if (user.favorites.includes(recipeId)) {
      user.favorites = user.favorites.filter(id => id.toString() !== recipeId);
      await user.save();
      res.json({ favorited: false });
    } else {
      user.favorites.push(recipeId);
      await user.save();
      res.json({ favorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the user is the creator
    if (recipe.createdBy && recipe.createdBy.toString() !== req.user) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};