const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  filterRecipes,
  toggleFavorite,
  getFavorites,
  addReview,
  deleteRecipe
} = require('../controllers/recipeController');
const auth = require('../middleware/auth');

router.get('/', getAllRecipes);
router.get('/filter', filterRecipes);
router.get('/favorites', auth, getFavorites);
router.get('/:id', getRecipe);
router.post('/', auth, createRecipe);
router.put('/:id', auth, updateRecipe);
router.post('/:id/favorite', auth, toggleFavorite);
router.post('/:id/review', auth, addReview);
router.delete('/:id', auth, deleteRecipe);

module.exports = router;