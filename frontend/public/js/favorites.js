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
                <div style="font-size: 80px; margin-bottom: 20px;">💔</div>
                <h3 style="margin-bottom: 15px;">Войдите в аккаунт, чтобы видеть избранное</h3>
                <a href="login.html" style="display: inline-block; padding: 12px 24px; background: linear-gradient(90deg, #38bdf8, #a78bfa); border-radius: 8px; color: white; text-decoration: none;">Войти</a>
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/favorites/${currentUser.id}`);
        const favorites = await response.json();
        favoritesContainer.innerHTML = '';
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="favorites-empty" style="text-align: center; padding: 60px; grid-column: 1 / -1;">
                    <div style="font-size: 80px; margin-bottom: 20px;">💔</div>
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
