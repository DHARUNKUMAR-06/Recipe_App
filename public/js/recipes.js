// Load all recipes
async function loadRecipes() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/landing.html';
        return;
    }

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

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let html = '';
    recipes.forEach(recipe => {
        let editBtn = '';
        let viewBtn = `<a href="/recipe.html?id=${recipe._id}" class="btn-view">View & Rate</a>`;

        if (user.role === 'admin') {
            editBtn = `<a href="/edit-recipe.html?id=${recipe._id}" class="btn-view" style="background: var(--warning); color: #fff;">Edit</a>`;
            viewBtn = `<a href="/recipe.html?id=${recipe._id}" class="btn-view" style="background: var(--secondary);">Reviews</a>`;
        } else if (recipe.createdBy === user.id) {
            editBtn = `<a href="/edit-recipe.html?id=${recipe._id}" class="btn-view" style="background: var(--warning); color: #fff;">Edit</a>`;
        }

        html += `
            <div class="recipe-card">
                <div class="recipe-image-wrapper">
                    <img src="${recipe.imageUrl || 'https://via.placeholder.com/300x200?text=Recipe'}" alt="${recipe.title}">
                </div>
                <div class="recipe-content">
                    <h3>${recipe.title}</h3>
                    <div style="margin-bottom: 10px; font-size: 0.95rem; color: #f39c12;">
                        ${recipe.averageRating ? '★'.repeat(Math.round(recipe.averageRating)) + '☆'.repeat(5 - Math.round(recipe.averageRating)) : 'No ratings'} 
                        <span style="color: #666; font-size: 0.85rem;">(${recipe.reviews ? recipe.reviews.length : 0})</span>
                    </div>
                    <div class="recipe-meta">
                        <span class="cuisine-tag">${recipe.cuisine}</span>
                        <span class="diet-tag">${recipe.dietType}</span>
                    </div>
                    <div class="recipe-actions">
                        ${viewBtn}
                        ${editBtn}
                        ${user.role !== 'admin' ? `
                        <button class="btn-favorite" onclick="toggleFavorite(this, '${recipe._id}')" aria-label="Favorite">
                            ❤
                        </button>
                        ` : ''}
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
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/landing.html';
        return;
    }

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

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Hide form if admin
    let reviewFormHtml = '';
    if (user.role !== 'admin') {
        reviewFormHtml = `
            <div class="review-form-container" style="background: var(--surface); padding: 20px; border-radius: 8px;">
                <h4 style="margin-bottom: 15px;">Add Your Review</h4>
                <form id="review-form" onsubmit="submitReview(event, '${recipe._id}')">
                    <div style="margin-bottom: 15px;">
                        <label for="reviewName" style="display: block; margin-bottom: 5px;">Your Name (optional):</label>
                        <input type="text" id="reviewName" placeholder="Leave blank to use registered name" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="rating" style="display: block; margin-bottom: 5px;">Rating (1-5):</label>
                        <select id="rating" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border);">
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Terrible</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="comment" style="display: block; margin-bottom: 5px;">Comment:</label>
                        <textarea id="comment" rows="3" required style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border);"></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%;">Submit Review</button>
                </form>
            </div>
        `;
    }

    const html = `
        <div class="recipe-detail">
            <h1>${recipe.title}</h1>
            <div class="rating-display" style="font-size: 1.2rem; color: #f39c12; margin-bottom: 10px;">
                ${recipe.averageRating ? '★'.repeat(Math.round(recipe.averageRating)) + '☆'.repeat(5 - Math.round(recipe.averageRating)) : 'No ratings yet'}
                <span style="color: #666; font-size: 1rem;">(${recipe.reviews ? recipe.reviews.length : 0} reviews)</span>
            </div>
            <img src="${recipe.imageUrl}" alt="${recipe.title}">
            
            <div class="recipe-meta">
                <span class="cuisine-tag">${recipe.cuisine}</span>
                <span class="diet-tag">${recipe.dietType}</span>
            </div>
            
            <h3>Ingredients:</h3>
            <p>${(recipe.ingredients || '').replace(/\n/g, '<br>')}</p>
            
            <h3>Instructions:</h3>
            <p>${(recipe.instructions || '').replace(/\n/g, '<br>')}</p>

            <hr style="margin: 30px 0; border: 1px solid var(--border);">

            <h3>Reviews & Ratings:</h3>
            <div id="reviews-list" style="margin-bottom: 20px;">
                ${(!recipe.reviews || recipe.reviews.length === 0) ? '<p>No reviews yet.</p>' :
            recipe.reviews.map(r => `
                    <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                        <div style="font-weight: bold;">${r.name || 'Anonymous'} <span style="color: #f39c12;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
                        <div style="font-size: 0.9rem; color: #555;">${new Date(r.createdAt).toLocaleDateString()}</div>
                        <p style="margin-top: 5px;">${r.comment}</p>
                    </div>
                  `).join('')}
            </div>

            ${reviewFormHtml}
        </div>
    `;

    container.innerHTML = html;
}

// Submit review
window.submitReview = async function (event, recipeId) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to submit a review.');
        window.location.href = '/landing.html';
        return;
    }

    const rating = document.getElementById('rating').value;
    const comment = document.getElementById('comment').value;
    const reviewName = document.getElementById('reviewName').value;

    try {
        await API.addReview(recipeId, { rating, comment, reviewName });
        alert('Review submitted successfully!');
        // Reload details to show the new review
        loadRecipeDetails();
    } catch (error) {
        alert(error.message || 'Failed to submit review');
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadRecipes();
    }

    if (window.location.pathname.includes('recipe.html')) {
        loadRecipeDetails();
    }
});