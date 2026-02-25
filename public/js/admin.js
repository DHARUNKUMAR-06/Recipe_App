let adminDataCache = null;

// Load Admin Analytics
async function loadAnalytics() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Security check
    if (!token || !user || user.role !== 'admin') {
        window.location.href = '/';
        return;
    }

    try {
        const loading = document.getElementById('loading');
        const content = document.getElementById('dashboard-content');

        loading.style.display = 'block';
        content.style.display = 'none';

        const data = await API.getAnalytics();
        adminDataCache = data;

        // Update Stats
        document.getElementById('stat-users').innerText = data.totalUsers;
        document.getElementById('stat-recipes').innerText = data.totalRecipes;
        document.getElementById('stat-reviews').innerText = data.totalReviews;
        document.getElementById('stat-rating').innerText = data.averageAppRating.toFixed(1);

        // Render Charts
        renderBarChart('cuisine-chart', data.cuisineStats, data.totalRecipes);
        renderBarChart('diet-chart', data.dietStats, data.totalRecipes);

        loading.style.display = 'none';
        content.style.display = 'block';
    } catch (error) {
        console.error('Error fetching analytics:', error);
        alert('Failed to load dashboard data: ' + error.message);
    }
}

// Render simple horizontal bar chart
function renderBarChart(elementId, stats, total) {
    const container = document.getElementById(elementId);
    if (!container) return;

    // Convert to sorted array
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    let html = '';
    sortedStats.forEach(([label, count]) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        html += `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${label}</span>
                    <span style="color: var(--gray);">${count} (${percentage}%)</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    });

    if (sortedStats.length === 0) {
        html = '<p style="color: var(--gray); text-align: center;">No data available.</p>';
    }

    container.innerHTML = html;
}

// Ensure init
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        loadAnalytics();
    }
});

// Show detailed data table
window.showTable = function (type) {
    if (!adminDataCache) return;
    const container = document.getElementById('data-tables-container');
    container.style.display = 'block';

    let html = '';

    if (type === 'users') {
        html += `
            <h3><span>Users List</span> <button class="close-btn" onclick="document.getElementById('data-tables-container').style.display='none'">Close</button></h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminDataCache.users ? adminDataCache.users.map(u => `
                        <tr>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>${u.role}</td>
                            <td>${new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="4">No users found</td></tr>'}
                </tbody>
            </table>
        `;
    } else if (type === 'recipes') {
        html += `
            <h3><span>Recipes List</span> <button class="close-btn" onclick="document.getElementById('data-tables-container').style.display='none'">Close</button></h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Cuisine</th>
                        <th>Diet Type</th>
                        <th>Author</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminDataCache.recipes ? adminDataCache.recipes.map(r => `
                        <tr>
                            <td><a href="/recipe.html?id=${r._id}" style="color: var(--primary); font-weight: 500;">${r.title}</a></td>
                            <td>${r.cuisine}</td>
                            <td>${r.dietType}</td>
                            <td>${r.createdBy ? r.createdBy.name : 'Unknown User'}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="4">No recipes found</td></tr>'}
                </tbody>
            </table>
        `;
    } else if (type === 'reviews') {
        html += `
            <h3><span>All Reviews</span> <button class="close-btn" onclick="document.getElementById('data-tables-container').style.display='none'">Close</button></h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Recipe</th>
                        <th>Reviewer</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminDataCache.allReviews && adminDataCache.allReviews.length > 0 ? adminDataCache.allReviews.map(r => `
                        <tr>
                            <td><strong>${r.recipeTitle}</strong></td>
                            <td>${r.userName}</td>
                            <td style="color: #f39c12;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
                            <td>"${r.comment}"</td>
                            <td>${new Date(r.date || Date.now()).toLocaleDateString()}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align: center;">No reviews found across any recipes.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    container.innerHTML = html;

    // Smooth scroll down slightly if desktop
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
