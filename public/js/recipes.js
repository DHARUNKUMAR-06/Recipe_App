// Load all recipes
async function loadRecipes() {
    try {
        const recipes = await API.getAllRecipes();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Display recipes
function displayRecipes(recipes) {
    const container = document.getElementById('recipes-container');
    if (!container) return;

    if (!recipes || recipes.length === 0) {
        container.innerHTML = '<p>No recipes found</p>';
        return;
    }

    let html = '';
    recipes.forEach(recipe => {
        html += `
            <div class="recipe-card">
                <div class="recipe-image-wrapper">
                    <img src="${recipe.imageUrl || 'https://via.placeholder.com/300x200?text=Recipe'}" alt="${recipe.title}">
                </div>
                <div class="recipe-content">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="cuisine-tag">${recipe.cuisine}</span>
                        <span class="diet-tag">${recipe.dietType}</span>
                    </div>
                    <div class="recipe-actions">
                        <a href="/recipe.html?id=${recipe._id}" class="btn-view">View</a>
                        <a href="/edit-recipe.html?id=${recipe._id}" class="btn-view" style="background: var(--warning); color: #fff;">Edit</a>
                        <button class="btn-favorite" onclick="toggleFavorite(this, '${recipe._id}')" aria-label="Favorite">
                            ❤
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Apply filters
async function applyFilters() {
    const cuisine = document.getElementById('cuisine-filter')?.value;
    const diet = document.getElementById('diet-filter')?.value;

    try {
        const recipes = await API.filterRecipes(cuisine, diet);
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load single recipe
async function loadRecipeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        window.location.href = '/';
        return;
    }

    try {
        const recipe = await API.getRecipe(recipeId);
        displayRecipeDetails(recipe);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Display recipe details
function displayRecipeDetails(recipe) {
    const container = document.getElementById('recipe-detail-container');
    if (!container) return;

    const html = `
        <div class="recipe-detail">
            <h1>${recipe.title}</h1>
            <img src="${recipe.imageUrl}" alt="${recipe.title}">
            
            <div class="recipe-meta">
                <span class="cuisine-tag">${recipe.cuisine}</span>
                <span class="diet-tag">${recipe.dietType}</span>
            </div>
            
            <h3>Ingredients:</h3>
            <p>${(recipe.ingredients || '').replace(/\n/g, '<br>')}</p>
            
            <h3>Instructions:</h3>
            <p>${(recipe.instructions || '').replace(/\n/g, '<br>')}</p>
        </div>
    `;

    container.innerHTML = html;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadRecipes();
    }

    if (window.location.pathname.includes('recipe.html')) {
        loadRecipeDetails();
    }
});