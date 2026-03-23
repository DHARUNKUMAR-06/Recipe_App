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
        renderPieChart('cuisine-chart', data.cuisineStats);
        renderPieChart('diet-chart', data.dietStats);
        renderGrowthChart(data.users, data.recipes);

        loading.style.display = 'none';
        content.style.display = 'block';
    } catch (error) {
        console.error('Error fetching analytics:', error);
        alert('Failed to load dashboard data: ' + error.message);
    }
}

const chartInstances = {};

// Render Chart.js Doughnut Chart
function renderPieChart(elementId, stats) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    // Convert to sorted array
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    
    if (sortedStats.length === 0) {
        return;
    }

    const labels = sortedStats.map(s => s[0]);
    const data = sortedStats.map(s => s[1]);
    
    if (chartInstances[elementId]) {
        chartInstances[elementId].destroy();
    }
    
    // Background colors based on UI theme (--primary, --secondary, --warning, --danger, --dark, etc)
    const bgColors = [
        '#10b981', // --primary
        '#84cc16', // --secondary
        '#f59e0b', // --warning
        '#ef4444', // --danger
        '#059669', // --primary-dark
        '#65a30d', // --secondary-dark
        '#064e3b', // --dark
        '#64748b'  // --gray
    ];
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f1f1f1' : '#333';
    
    chartInstances[elementId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: isDarkMode ? '#1a1a1a' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Render Platform Growth Chart using Chart.js
function renderGrowthChart(users, recipes) {
    if (!users) users = [];
    if (!recipes) recipes = [];
    
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;
    
    // Aggregate by Month-Year
    const getMonthYear = (dateStr) => {
        const d = new Date(dateStr || Date.now());
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
    };

    const userCounts = {};
    const recipeCounts = {};
    const allLabelsTemp = new Set();
    
    users.forEach(u => {
        const my = getMonthYear(u.createdAt);
        userCounts[my] = (userCounts[my] || 0) + 1;
        allLabelsTemp.add(my);
    });
    
    recipes.forEach(r => {
        const my = getMonthYear(r.createdAt);
        recipeCounts[my] = (recipeCounts[my] || 0) + 1;
        allLabelsTemp.add(my);
    });
    
    // Sort labels chronologically
    const allLabels = Array.from(allLabelsTemp).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    let cumulativeUsers = 0;
    const userData = allLabels.map(label => {
        cumulativeUsers += (userCounts[label] || 0);
        return cumulativeUsers;
    });
    
    let cumulativeRecipes = 0;
    const recipeData = allLabels.map(label => {
        cumulativeRecipes += (recipeCounts[label] || 0);
        return cumulativeRecipes;
    });

    if (window.growthChartInstance) {
        window.growthChartInstance.destroy();
    }

    window.growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Total Users',
                    data: userData,
                    borderColor: '#10b981', // --primary
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Total Recipes',
                    data: recipeData,
                    borderColor: '#84cc16', // --secondary
                    backgroundColor: 'rgba(132, 204, 22, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
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
