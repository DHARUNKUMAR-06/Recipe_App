// Check login status
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const usernameSpan = document.getElementById('username');

    if (token && user) {
        if (authLinks) authLinks.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'inline-flex';
            usernameSpan.innerHTML = `${user.name} ${user.role === 'admin' ? '<span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-left: 5px;">Admin</span>' : ''}`;
        }

        // Show/Hide user-specific links for admin
        if (user.role === 'admin') {
            document.querySelectorAll('a[href="/favorites.html"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('a[href="/admin-dashboard.html"]').forEach(el => el.style.display = 'inline-block');
        } else {
            // Hide admin-specific links for regular users
            document.querySelectorAll('a[href="/add-recipe.html"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('a[href="/admin-dashboard.html"]').forEach(el => el.style.display = 'none');
        }
    } else {
        if (authLinks) authLinks.style.display = 'inline-flex';
        if (userInfo) userInfo.style.display = 'none';
        // Hide Favorites and Add Recipe link if not logged in
        document.querySelectorAll('a[href="/favorites.html"]').forEach(el => el.style.display = 'none');
        document.querySelectorAll('a[href="/add-recipe.html"]').forEach(el => el.style.display = 'none');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Handle register
if (window.location.pathname.includes('register.html') || window.location.pathname.includes('landing.html')) {
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errDiv = document.getElementById('register-error');
        if (errDiv) errDiv.style.display = 'none';

        const userData = {
            name: document.getElementById('register-name') ? document.getElementById('register-name').value : document.getElementById('name').value,
            email: document.getElementById('register-email') ? document.getElementById('register-email').value : document.getElementById('email').value,
            password: document.getElementById('register-password') ? document.getElementById('register-password').value : document.getElementById('password').value
        };

        try {
            const data = await API.register(userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } catch (error) {
            if (errDiv) {
                errDiv.textContent = error.message;
                errDiv.style.display = 'block';
            } else {
                alert(error.message);
            }
        }
    });
}

// Handle login
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('landing.html')) {
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errDiv = document.getElementById('login-error');
        if (errDiv) errDiv.style.display = 'none';

        const credentials = {
            email: document.getElementById('login-email') ? document.getElementById('login-email').value : document.getElementById('email').value,
            password: document.getElementById('login-password') ? document.getElementById('login-password').value : document.getElementById('password').value
        };

        try {
            const data = await API.login(credentials);
            if (data.user.role === 'admin') {
                alert('You are logging in with an Admin account');
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } catch (error) {
            if (errDiv) {
                errDiv.textContent = error.message;
                errDiv.style.display = 'block';
            } else {
                alert(error.message);
            }
        }
    });
}

// Handle admin login
if (window.location.pathname.includes('admin-login.html')) {
    document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errDiv = document.getElementById('admin-login-error');
        if (errDiv) errDiv.style.display = 'none';

        const credentials = {
            email: document.getElementById('admin-email').value,
            password: document.getElementById('admin-password').value
        };

        try {
            const data = await API.adminLogin(credentials);
            alert('You are logging in with an Admin account');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // You can redirect to a specific admin dashboard if you have one, or to home page.
            window.location.href = '/';
        } catch (error) {
            if (errDiv) {
                errDiv.textContent = error.message;
                errDiv.style.display = 'block';
            } else {
                alert(error.message);
            }
        }
    });
}

// Toggle Favorite
window.toggleFavorite = async function (btn, recipeId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to favorite recipes');
        window.location.href = '/landing.html';
        return;
    }

    try {
        const response = await API.toggleFavorite(recipeId);

        // Update visually by toggling the favorited class on the button that was clicked
        if (btn && btn.classList) {
            if (response.favorited) {
                btn.classList.add('favorited');
            } else {
                btn.classList.remove('favorited');
            }
        }

        // If on favorites page, we might want to reload or remove card
        if (window.location.pathname.includes('favorites.html') && !response.favorited) {
            btn.closest('.recipe-card').remove();

            // Re-check empty state if needed
            const container = document.getElementById('favorites-container');
            if (container && container.children.length === 0) {
                container.innerHTML = '<p>No favorite recipes yet</p>';
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert(error.message || 'Failed to toggle favorite');
    }
};

// Check auth on every page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Dynamically load chat widget only if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        const chatScript = document.createElement('script');
        chatScript.src = '/js/chat-widget.js';
        document.body.appendChild(chatScript);
    }
});
