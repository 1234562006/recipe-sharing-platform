/**
 * RecipeNest - UI Components & Helpers
 */

const ui = {
  // Graceful SVG placeholder for recipes without images or broken URLs
  PLACEHOLDER_IMAGE:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f1f5f9"><rect width="600" height="400" fill="%23fed7aa"/><g fill="%23ea580c" opacity="0.6" transform="translate(236, 136) scale(4)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></g><text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="%239a3412" font-family="system-ui, sans-serif" font-weight="bold" font-size="20">RecipeNest Culinary Creation</text></svg>',

  fallbackImage(imgElement) {
    if (imgElement) {
      imgElement.onerror = null;
      imgElement.src = this.PLACEHOLDER_IMAGE;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  formatTime(minutes) {
    if (!minutes || minutes <= 0) return '0 min';
    const mins = Number(minutes);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;

    if (type === 'error') {
      icon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    } else if (type === 'info') {
      icon = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div>${icon}</div>
      <div style="flex: 1;">${this.escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  showConfirm(title, message, onConfirm, confirmText = 'Confirm', isDanger = true) {
    let backdrop = document.getElementById('modal-confirm-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'modal-confirm-backdrop';
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal-box">
          <div class="modal-header">
            <h3 id="modal-title" style="margin-bottom: 0.5rem;">Confirm Action</h3>
            <p id="modal-desc" style="color: var(--text-secondary); font-size: 0.95rem;"></p>
          </div>
          <div class="modal-footer">
            <button id="modal-cancel-btn" class="btn btn-outline">Cancel</button>
            <button id="modal-confirm-btn" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}">${confirmText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    const titleEl = backdrop.querySelector('#modal-title');
    const descEl = backdrop.querySelector('#modal-desc');
    const cancelBtn = backdrop.querySelector('#modal-cancel-btn');
    const confirmBtn = backdrop.querySelector('#modal-confirm-btn');

    titleEl.textContent = title;
    descEl.textContent = message;
    confirmBtn.className = `btn ${isDanger ? 'btn-danger' : 'btn-primary'}`;
    confirmBtn.textContent = confirmText;

    backdrop.classList.add('show');

    const cleanup = () => {
      backdrop.classList.remove('show');
      cancelBtn.onclick = null;
      confirmBtn.onclick = null;
    };

    cancelBtn.onclick = cleanup;
    confirmBtn.onclick = async () => {
      cleanup();
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
    };
  },

  renderRecipeCard(recipe, options = {}) {
    const { showDelete = false, showEdit = false, onDelete, onEdit } = options;
    const authorName = recipe.author ? recipe.author.name : 'Community Chef';
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
    const imageUrl = recipe.imageUrl || this.PLACEHOLDER_IMAGE;
    const isFavorited = recipe.isFavorited || false;

    const diffClass =
      recipe.difficulty === 'Hard'
        ? 'diff-hard'
        : recipe.difficulty === 'Medium'
        ? 'diff-medium'
        : 'diff-easy';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.id = recipe._id;

    card.innerHTML = `
      <div class="recipe-card-media">
        <span class="card-category-badge">${this.escapeHtml(recipe.category)}</span>
        <button class="card-favorite-btn ${isFavorited ? 'favorited' : ''}" 
                title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
                data-recipe-id="${recipe._id}"
                aria-label="Toggle favorite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img class="recipe-card-img" 
             src="${this.escapeHtml(imageUrl)}" 
             alt="${this.escapeHtml(recipe.title)}" 
             loading="lazy"
             onerror="ui.fallbackImage(this)">
      </div>
      <div class="recipe-card-body">
        <h3 class="recipe-card-title">
          <a href="/recipe-details.html?id=${recipe._id}">${this.escapeHtml(recipe.title)}</a>
        </h3>
        <p class="recipe-card-desc">${this.escapeHtml(recipe.description || 'Delicious home-crafted recipe.')}</p>
        
        <div class="recipe-card-meta">
          <span class="meta-item" title="Total cooking & prep time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${this.formatTime(totalTime)}
          </span>
          <span class="difficulty-badge ${diffClass}">${this.escapeHtml(recipe.difficulty || 'Easy')}</span>
          <span class="meta-item" title="Servings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            ${recipe.servings || 2} serv
          </span>
        </div>

        <div class="recipe-card-footer">
          <div class="recipe-author">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${this.escapeHtml(authorName)}</span>
          </div>

          ${
            showEdit || showDelete
              ? `
            <div style="display: flex; gap: 0.35rem;">
              ${
                showEdit
                  ? `<a href="/edit-recipe.html?id=${recipe._id}" class="btn btn-sm btn-outline" title="Edit recipe">Edit</a>`
                  : ''
              }
              ${
                showDelete
                  ? `<button class="btn btn-sm btn-danger btn-delete-recipe" data-id="${recipe._id}" title="Delete recipe">Delete</button>`
                  : ''
              }
            </div>
            `
              : `
            <a href="/recipe-details.html?id=${recipe._id}" class="btn btn-sm btn-outline-primary">
              View
            </a>
            `
          }
        </div>
      </div>
    `;

    // Bind favorite button event
    const favBtn = card.querySelector('.card-favorite-btn');
    favBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!auth.isLoggedIn()) {
        ui.showToast('Please log in to save recipes to your favorites.', 'info');
        setTimeout(() => {
          window.location.href = `/login.html?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
        }, 1200);
        return;
      }

      const isCurrentlyFavorited = favBtn.classList.contains('favorited');
      try {
        if (isCurrentlyFavorited) {
          await api.delete(`/favorites/${recipe._id}`);
          favBtn.classList.remove('favorited');
          favBtn.title = 'Add to favorites';
          favBtn.querySelector('svg').setAttribute('fill', 'none');
          ui.showToast('Removed from favorites', 'info');
          if (options.onFavoriteRemoved) {
            options.onFavoriteRemoved(recipe._id, card);
          }
        } else {
          await api.post(`/favorites/${recipe._id}`, {});
          favBtn.classList.add('favorited');
          favBtn.title = 'Remove from favorites';
          favBtn.querySelector('svg').setAttribute('fill', 'currentColor');
          ui.showToast('Added to your favorites!', 'success');
        }
      } catch (err) {
        ui.showToast(err.message || 'Failed to update favorites', 'error');
      }
    });

    // Bind delete button if present
    if (showDelete) {
      const delBtn = card.querySelector('.btn-delete-recipe');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          ui.showConfirm(
            'Delete Recipe',
            `Are you sure you want to permanently delete "${recipe.title}"? This action cannot be undone.`,
            async () => {
              try {
                await api.delete(`/recipes/${recipe._id}`);
                ui.showToast('Recipe deleted successfully!', 'success');
                card.remove();
                if (typeof onDelete === 'function') onDelete(recipe._id);
              } catch (err) {
                ui.showToast(err.message || 'Could not delete recipe', 'error');
              }
            }
          );
        });
      }
    }

    return card;
  },

  renderEmptyState(container, title, message, actionText, actionLink) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/>
          </svg>
        </div>
        <h3>${this.escapeHtml(title)}</h3>
        <p>${this.escapeHtml(message)}</p>
        ${
          actionText && actionLink
            ? `<a href="${actionLink}" class="btn btn-primary">${this.escapeHtml(actionText)}</a>`
            : ''
        }
      </div>
    `;
  },
};

window.ui = ui;
