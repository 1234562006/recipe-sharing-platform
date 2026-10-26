/**
 * RecipeNest - Authentication Service
 */

const auth = {
  TOKEN_KEY: 'recipenest_token',
  USER_KEY: 'recipenest_user',

  isLoggedIn() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.syncNavbar();
  },

  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    if (window.ui) {
      ui.showToast('You have been logged out.', 'info');
    }
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 600);
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login.html?redirect=${currentPath}`;
      return false;
    }
    return true;
  },

  redirectIfAuthenticated(defaultRedirect = '/recipes.html') {
    if (this.isLoggedIn()) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || defaultRedirect;
      window.location.href = decodeURIComponent(redirect);
    }
  },

  async verifySession() {
    if (!this.isLoggedIn()) return;
    try {
      const res = await api.get('/auth/me');
      if (res && res.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.syncNavbar();
      }
    } catch (err) {
      if (err.status === 401) {
        // Invalid or expired token
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.syncNavbar();
      }
    }
  },

  syncNavbar() {
    const user = this.getUser();
    const guestActions = document.getElementById('nav-guest-actions');
    const userActions = document.getElementById('nav-user-actions');
    const userNameDisplay = document.getElementById('nav-user-name');
    const userAvatarDisplay = document.getElementById('nav-user-avatar');

    if (user && this.isLoggedIn()) {
      if (guestActions) guestActions.style.display = 'none';
      if (userActions) userActions.style.display = 'flex';
      if (userNameDisplay) userNameDisplay.textContent = user.name.split(' ')[0];
      if (userAvatarDisplay) userAvatarDisplay.textContent = user.name.charAt(0).toUpperCase();
    } else {
      if (guestActions) guestActions.style.display = 'flex';
      if (userActions) userActions.style.display = 'none';
    }
  },
};

window.auth = auth;
