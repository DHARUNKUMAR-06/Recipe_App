const API = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    // Auth
    async register(userData) {
        return this.request('/api/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async login(credentials) {
        return this.request('/api/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async adminLogin(credentials) {
        return this.request('/api/users/admin-login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    // Recipes
    async getAllRecipes() {
        return this.request('/api/recipes');
    },

    async getRecipe(id) {
        return this.request(`/api/recipes/${id}`);
    },

    async createRecipe(recipeData) {
        return this.request('/api/recipes', {
            method: 'POST',
            body: JSON.stringify(recipeData)
        });
    },

    async filterRecipes(cuisine, dietType) {
        let query = '';
        if (cuisine || dietType) {
            query = '?';
            if (cuisine) query += `cuisine=${cuisine}&`;
            if (dietType) query += `dietType=${dietType}`;
        }
        return this.request(`/api/recipes/filter${query}`);
    },

    async toggleFavorite(recipeId) {
        return this.request(`/api/recipes/${recipeId}/favorite`, {
            method: 'POST'
        });
    },

    async getFavorites() {
        return this.request('/api/recipes/favorites');
    },

    async addReview(recipeId, reviewData) {
        return this.request(`/api/recipes/${recipeId}/review`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    async deleteRecipe(id) {
        return this.request(`/api/recipes/${id}`, {
            method: 'DELETE'
        });
    },

    // Admin
    async getAnalytics() {
        return this.request('/api/admin/analytics');
    }
};