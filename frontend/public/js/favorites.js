// favorites.js
document.addEventListener('DOMContentLoaded', function() {
    loadFavoriteProducts();
    setupFavoritesEvents();
});

// Загрузка избранных товаров
async function loadFavoriteProducts() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const favoritesContainer = document.querySelector('.favorites');
    
    if (!favoritesContainer) return;
    
    if (!currentUser) {
        favoritesContainer.innerHTML = `
            <div class="favorites-empty" style="text-align: center; padding: 60px; grid-column: 1 / -1;">
                <div style="margin-bottom: 20px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="#ef4444" style="display: inline-block;">
                        <path xmlns="http://www.w3.org/2000/svg" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C8.17,3 8.82,3.12 9.44,3.33L13,9.35L9,14.35L12,21.35V21.35M16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35L11,14.35L15.5,9.35L12.85,4.27C13.87,3.47 15.17,3 16.5,3Z"/>
                    </svg>
                </div>
                <h3 style="margin-bottom: 15px;">Войдите в аккаунт, чтобы видеть избранное</h3>
                <a href="login.html" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #38bdf8, #a78bfa); border-radius: 8px; color: white; text-decoration: none;">Войти</a>
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${currentUser.id}`);
        const favorites = await response.json();
        favoritesContainer.innerHTML = '';
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="favorites-empty" style="text-align: center; padding: 60px; grid-column: 1 / -1;">
                    <div style="margin-bottom: 20px;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="#ef4444" style="display: inline-block;">
                            <path xmlns="http://www.w3.org/2000/svg" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C8.17,3 8.82,3.12 9.44,3.33L13,9.35L9,14.35L12,21.35V21.35M16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35L11,14.35L15.5,9.35L12.85,4.27C13.87,3.47 15.17,3 16.5,3Z"/>
                        </svg>
                    </div>
                    <h3 style="margin-bottom: 15px;">В избранном пока ничего нет</h3>
                    <p style="color: #94a3b8; margin-bottom: 25px;">Добавляйте товары в избранное, чтобы не потерять</p>
                    <a href="catalog.html" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #38bdf8, #a78bfa); border-radius: 8px; color: white; text-decoration: none;">Перейти в каталог</a>
                </div>
            `;
            return;
        }
        favorites.forEach(item => {
            if (item.price) item.price = Number(item.price);
            if (item.old_price) item.old_price = Number(item.old_price);
            const wrapper = document.createElement('div');
            wrapper.innerHTML = UIUtils.createProductCard(item);
            const card = wrapper.firstElementChild;
            favoritesContainer.appendChild(card);
            // Пометить кнопку избранного как активную на странице избранного
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.classList.add('active');
                favBtn.innerHTML = '❤️';
                favBtn.setAttribute('data-product-id', item.id);
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
    }
}

// Настройка обработчиков событий
function setupFavoritesEvents() {
    // Удаление из избранного
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.remove-from-fav')) {
            const btn = e.target.closest('.remove-from-fav');
            const productId = btn.dataset.id;
            
            await toggleFavorite(productId);
            loadFavoriteProducts();
        }
        
        // Добавление в корзину из избранного
        if (e.target.closest('.add-to-cart-from-fav')) {
            const btn = e.target.closest('.add-to-cart-from-fav');
            const productId = btn.dataset.id;
            
            await addToCart(productId);
        }
    });
}
