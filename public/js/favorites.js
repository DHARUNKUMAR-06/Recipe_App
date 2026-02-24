// Load favorites
async function loadFavorites() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/landing.html';
        return;
    }

    try {
        const favorites = await API.getFavorites();
        displayFavorites(favorites);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Display favorites
function displayFavorites(recipes) {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    if (!recipes || recipes.length === 0) {
        container.innerHTML = '<p>No favorite recipes yet</p>';
        return;
    }

    let html = '';
    recipes.forEach(recipe => {
        html += `
            <div class="recipe-card">
                <div class="recipe-image-wrapper">
                    <img src="${recipe.imageUrl}" alt="${recipe.title}">
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
                        <button class="btn-favorite favorited" onclick="toggleFavorite(this, '${recipe._id}')" aria-label="Remove Favorite">
                            ❤
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initialize
if (window.location.pathname.includes('favorites.html')) {
    document.addEventListener('DOMContentLoaded', loadFavorites);
}