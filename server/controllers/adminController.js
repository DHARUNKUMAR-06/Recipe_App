const Recipe = require('../models/Recipe');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
    try {
        const totalRecipes = await Recipe.countDocuments();
        const totalUsers = await User.countDocuments();

        // Calculate total reviews and average rating across all recipes
        const recipes = await Recipe.find().populate('createdBy', 'name email');
        const users = await User.find().select('-password');
        let totalReviews = 0;
        let sumAverageRating = 0;
        let allReviews = [];

        // Group recipes by Cuisine and Diet Types for Charts
        const cuisineStats = {};
        const dietStats = {};

        recipes.forEach(recipe => {
            if (recipe.reviews && recipe.reviews.length > 0) {
                totalReviews += recipe.reviews.length;
                recipe.reviews.forEach(review => {
                    allReviews.push({
                        recipeTitle: recipe.title,
                        userName: review.name,
                        rating: review.rating,
                        comment: review.comment,
                        date: review.date
                    });
                });
            }
            if (recipe.averageRating) {
                sumAverageRating += recipe.averageRating;
            }

            const cuisine = recipe.cuisine || 'Unknown';
            cuisineStats[cuisine] = (cuisineStats[cuisine] || 0) + 1;

            const diet = recipe.dietType || 'Unknown';
            dietStats[diet] = (dietStats[diet] || 0) + 1;
        });

        const averageAppRating = totalRecipes > 0 ? (sumAverageRating / recipes.filter(r => r.averageRating).length || 0) : 0;

        res.json({
            totalRecipes,
            totalUsers,
            totalReviews,
            averageAppRating,
            cuisineStats,
            dietStats,
            users,
            recipes,
            allReviews
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
