/**
 * RecipeNest - Main Application Initialization & Navigation Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sync navbar with current authentication state
  if (window.auth) {
    auth.syncNavbar();
    auth.verifySession();
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navbar = document.querySelector('.navbar');
  if (mobileToggle && navbar) {
    mobileToggle.addEventListener('click', () => {
      navbar.classList.toggle('mobile-menu-open');
    });
  }

  // User profile dropdown toggle
  const userPill = document.getElementById('user-pill-btn');
  const userMenu = document.getElementById('user-menu-dropdown');
  if (userPill && userMenu) {
    userPill.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && !userPill.contains(e.target)) {
        userMenu.classList.remove('show');
      }
    });
  }

  // Global logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  }

  // Set active class on navbar links based on current path
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (
      href === currentPath ||
      (currentPath === '/' && href === '/index.html') ||
      (currentPath.endsWith(href) && href !== '/')
    ) {
      link.classList.add('active');
    }
  });
});
