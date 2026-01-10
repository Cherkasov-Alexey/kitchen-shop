// Простой API клиент для SmartCook
class SmartCookAPI {
    constructor() {
        // Автоматически определяем URL: локально или на Render
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : `${window.location.origin}/api`;
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.baseURL}/categories`);
            if (!response.ok) throw new Error('Ошибка сети');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
            return [];
        }
    }

    async getProducts(params = {}) {
        try {
            const url = new URL(`${this.baseURL}/products`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Ошибка сети');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            return [];
        }
    }

    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseURL}/products/${id}`);
            if (!response.ok) throw new Error('Ошибка сети');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            return null;
        }
    }
}

// Утилиты для создания UI элементов
class UIUtils {
    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    static createCategoryCard(category) {
        const url = category.name === 'Товары со скидкой' ? 'sales.html' : `catalog.html?category=${category.id}`;
        return `
            <div class="category-card" onclick="window.location.href='${url}'">
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
            </div>
        `;
    }

    // Простые кнопки категорий (как запросил пользователь)
    static createCategoryButton(category) {
        const isSale = category.category_name === 'товары со скидкой';
        const url = isSale ? 'sales.html' : `catalog.html?category=${category.id}`;
        const className = isSale ? 'category-btn sale-btn' : 'category-btn';

        return `
            <button class="${className}" onclick="window.location.href='${url}'">
                ${isSale ? '<span class="fire-icon">🔥</span>' : ''}
                ${category.category_name}
                ${isSale ? '<span class="fire-icon">🔥</span>' : ''}
            </button>
        `;
    }

    static createProductCard(product) {
        const hasDiscount = product.old_price && product.old_price > product.price;
        const isFavorite = this.isFavorite(product.id);
        const imageUrl = product.image_url || product.images?.split(',')[0] || '';
        return `
            <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                ${hasDiscount ? '<span class="sale-badge">СКИДКА</span>' : ''}
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.product_name}">
                </div>
                <div class="product-info">
                    <h3>${product.product_name}</h3>
                    <div class="price-container">
                        <div class="price-block">
                            ${hasDiscount ? `<span class="old-price">${this.formatPrice(product.old_price)}</span>` : ''}
                            <span class="price">${this.formatPrice(product.price)}</span>
                        </div>
                    </div>
                </div>
                <div class="product-actions" onclick="event.stopPropagation()">
                    <button class="add-to-cart-btn" data-product-id="${product.id}" onclick="event.stopPropagation(); addToCart(${product.id}); return false;">В корзину</button>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}" onclick="event.stopPropagation(); toggleFavorite(${product.id}); return false;">${isFavorite ? '♥' : '♡'}</button>
                </div>
            </div>
        `;
    }

    static isFavorite(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites.some(item => item.id == productId);
    }

    static showLoading(container) {
        container.innerHTML = '<div class="loading">Загрузка...</div>';
    }

    static showError(container, message = 'Ошибка загрузки') {
        container.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Глобальные переменные
const api = new SmartCookAPI();

// Вспомогательная функция для получения API URL
function getApiUrl() {
    return api.baseURL.replace('/api', '');
}

// Функции для работы с корзиной
async function addToCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Войдите в аккаунт, чтобы добавлять товары в корзину');
        return;
    }
    
    try {
        const response = await fetch(`${api.baseURL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                product_id: productId,
                quantity: 1
            })
        });
        
        if (!response.ok) throw new Error('Ошибка добавления в корзину');
        
        // Получаем информацию о товаре
        const product = await api.getProduct(productId);
        showNotification(`Товар "${product.product_name}" добавлен в корзину!`);
        updateCartCount();
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showNotification('Ошибка добавления в корзину');
    }
}

// Функции для работы с избранным
async function toggleFavorite(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Войдите в аккаунт, чтобы добавлять товары в избранное');
        return;
    }
    
    productId = parseInt(productId);
    
    try {
        // Проверяем, есть ли товар в избранном
        const checkResponse = await fetch(`${api.baseURL}/favorites/${currentUser.id}/${productId}`);
        const { isFavorite } = await checkResponse.json();
        
        if (isFavorite) {
            // Удаляем из избранного
            await fetch(`${api.baseURL}/favorites/${currentUser.id}/${productId}`, {
                method: 'DELETE'
            });
            showNotification('Товар удален из избранного');
            
            // Обновляем кнопки
            updateFavoriteButton(productId, false);
        } else {
            // Добавляем в избранное
            await fetch(`${api.baseURL}/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    product_id: productId
                })
            });
            
            const product = await api.getProduct(productId);
            showNotification(`Товар "${product.product_name}" добавлен в избранное`);
            
            // Обновляем кнопки
            updateFavoriteButton(productId, true);
        }
        
        // Перезагружаем страницу избранного если мы на ней
        if (typeof loadFavoriteProducts !== 'undefined') {
            loadFavoriteProducts();
        }
    } catch (error) {
        console.error('Ошибка работы с избранным:', error);
        showNotification('Ошибка');
    }
}

function updateFavoriteButton(productId, isFavorite) {
    // Обновляем кнопки в карточках товаров (на каталоге)
    const cardButtons = document.querySelectorAll(`[data-product-id="${productId}"]`);
    cardButtons.forEach(btn => {
        if (btn.classList.contains('favorite-btn')) {
            btn.textContent = isFavorite ? '♥' : '♡';
            if (isFavorite) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    
    // Обновляем кнопку на странице товара
    const productPageBtn = document.getElementById('favorite-btn');
    if (productPageBtn && parseInt(productPageBtn.dataset.id) === productId) {
        productPageBtn.innerHTML = isFavorite ? '♥ В избранном' : '♡ В избранное';
        if (isFavorite) {
            productPageBtn.classList.add('active');
        } else {
            productPageBtn.classList.remove('active');
        }
    }
}

// Обновление счетчика корзины
async function updateCartCount() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const counters = document.querySelectorAll('#cart-count, .cart-count');
        counters.forEach(counter => {
            counter.textContent = 0;
            counter.style.display = 'none';
        });
        return;
    }
    
    try {
        const response = await fetch(`${api.baseURL}/cart/${currentUser.id}`);
        const cart = await response.json();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const counters = document.querySelectorAll('#cart-count, .cart-count');
        counters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Ошибка обновления счетчика:', error);
    }
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ffff;
        color: #000;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    await updateAllFavoriteButtons();
});

// Обновление всех кнопок избранного на странице
async function updateAllFavoriteButtons() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${api.baseURL}/favorites/${currentUser.id}`);
        const favorites = await response.json();
        const favoriteIds = favorites.map(f => f.id);
        
        // Обновляем кнопки на карточках товаров
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            if (favoriteIds.includes(productId)) {
                btn.textContent = '♥';
                btn.classList.add('active');
            } else {
                btn.textContent = '♡';
                btn.classList.remove('active');
            }
        });
        
        // Обновляем кнопку на странице товара
        const productPageBtn = document.getElementById('favorite-btn');
        if (productPageBtn) {
            const productId = parseInt(productPageBtn.dataset.id);
            if (favoriteIds.includes(productId)) {
                productPageBtn.innerHTML = '♥ В избранном';
                productPageBtn.classList.add('active');
            } else {
                productPageBtn.innerHTML = '♡ В избранное';
                productPageBtn.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Ошибка обновления кнопок избранного:', error);
    }
}

// Загрузка категорий с товарами
async function loadCategoryProducts() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const categories = await api.getCategories();
        
        let html = '';
        for (const category of categories) {
            const products = await api.getProducts({ category_id: category.id, limit: 4 });
            
            if (products.length > 0) {
                html += `
                    <div class="category-section">
                        <h2 class="category-title">${category.name}</h2>
                        <div class="category-products">
                            ${products.map(p => UIUtils.createProductCard(p)).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        UIUtils.showError(container);
    }
}
