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
                ${isSale ? '<span class="fire-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6b35" style="vertical-align: middle;"><path xmlns="http://www.w3.org/2000/svg" d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z"/></svg></span>' : ''}
                ${category.category_name}
                ${isSale ? '<span class="fire-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6b35" style="vertical-align: middle;"><path xmlns="http://www.w3.org/2000/svg" d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z"/></svg></span>' : ''}
            </button>
        `;
    }

    static createProductCard(product) {
        const hasDiscount = product.old_price && product.old_price > product.price;
        const isFavorite = this.isFavorite(product.id);
        const imageUrl = product.image_url || product.images?.split(',')[0] || '';
        const imageUrlWithCache = imageUrl ? `${imageUrl}?v=2` : '';
        return `
            <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                ${hasDiscount ? '<span class="sale-badge">СКИДКА</span>' : ''}
                <div class="product-image">
                    <img src="${imageUrlWithCache}" alt="${product.product_name}">
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
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}" onclick="event.stopPropagation(); toggleFavorite(${product.id}); return false;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            ${isFavorite 
                                ? '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>'
                                : '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>'}
                        </svg>
                    </button>
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
        
        // Обновляем кнопку на странице товара
        updateAddToCartButton(productId, 1);
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showNotification('Ошибка добавления в корзину');
    }
}

// Функция для обновления кнопки "Добавить в корзину"
async function updateAddToCartButton(productId, quantity) {
    // Пробуем найти кнопку в карточке товара
    let btn = document.querySelector(`[data-product-id="${productId}"].add-to-cart-btn`);
    
    // Если не нашли, пробуем на странице товара
    if (!btn) {
        btn = document.getElementById('add-to-cart-btn');
        // Проверяем, что это тот же товар
        if (btn && btn.dataset.id && parseInt(btn.dataset.id) !== productId) {
            return;
        }
    }
    
    if (!btn) return;
    
    if (quantity > 0) {
        btn.textContent = 'Изменить количество';
        btn.onclick = (e) => {
            e.stopPropagation();
            openQuantityModal(productId, quantity);
        };
    } else {
        btn.textContent = btn.id === 'add-to-cart-btn' ? 'Добавить в корзину' : 'В корзину';
        btn.onclick = (e) => {
            e.stopPropagation();
            addToCart(productId);
        };
    }
}

// Функция для изменения количества товара в корзине
async function changeCartQuantity(productId, delta) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        // Получаем текущее количество
        const cartResponse = await fetch(`${api.baseURL}/cart/${currentUser.id}`);
        const cartItems = await cartResponse.json();
        const item = cartItems.find(i => i.id == productId);
        
        if (!item) return;
        
        const newQuantity = item.quantity + delta;
        
        if (newQuantity <= 0) {
            // Удаляем товар из корзины
            await fetch(`${api.baseURL}/cart/${currentUser.id}/${productId}`, {
                method: 'DELETE'
            });
            updateAddToCartButton(productId, 0);
            showNotification('Товар удален из корзины');
        } else {
            // Обновляем количество
            await fetch(`${api.baseURL}/cart`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    product_id: productId,
                    quantity: newQuantity
                })
            });
            updateAddToCartButton(productId, newQuantity);
        }
        
        updateCartCount();
    } catch (error) {
        console.error('Ошибка изменения количества:', error);
        showNotification('Ошибка изменения количества');
    }
}

// Функция для открытия модального окна изменения количества
function openQuantityModal(productId, currentQuantity) {
    const modal = document.createElement('div');
    modal.className = 'quantity-modal-overlay';
    modal.innerHTML = `
        <div class="quantity-modal">
            <h3>Изменить количество</h3>
            <div class="quantity-modal-body">
                <label>Количество товара:</label>
                <input type="number" id="quantity-input" value="${currentQuantity}" min="0" max="999">
            </div>
            <div class="quantity-modal-actions">
                <button class="modal-btn modal-cancel" onclick="closeQuantityModal()">Отмена</button>
                <button class="modal-btn modal-delete" onclick="deleteFromCart(${productId})">Удалить из корзины</button>
                <button class="modal-btn modal-save" onclick="saveQuantity(${productId})">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('quantity-input').focus();
}

function closeQuantityModal() {
    const modal = document.querySelector('.quantity-modal-overlay');
    if (modal) modal.remove();
}

async function saveQuantity(productId) {
    const input = document.getElementById('quantity-input');
    const newQuantity = parseInt(input.value) || 0;
    closeQuantityModal();
    await changeCartQuantity(productId, newQuantity - (await getCartItemQuantity(productId)));
}

async function deleteFromCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        await fetch(`${api.baseURL}/cart/${currentUser.id}/${productId}`, {
            method: 'DELETE'
        });
        updateAddToCartButton(productId, 0);
        updateCartCount();
        closeQuantityModal();
        showNotification('Товар удален из корзины');
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showNotification('Ошибка удаления товара');
    }
}

async function getCartItemQuantity(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return 0;
    
    try {
        const response = await fetch(`${api.baseURL}/cart/${currentUser.id}`);
        const cartItems = await response.json();
        const item = cartItems.find(i => i.id == productId);
        return item ? item.quantity : 0;
    } catch (error) {
        return 0;
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
            const svg = btn.querySelector('svg');
            if (svg) {
                if (isFavorite) {
                    svg.innerHTML = '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>';
                    btn.classList.add('active');
                } else {
                    svg.innerHTML = '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>';
                    btn.classList.remove('active');
                }
            }
        }
    });
    
    // Обновляем кнопку на странице товара
    const productPageBtn = document.getElementById('favorite-btn');
    if (productPageBtn && parseInt(productPageBtn.dataset.id) === productId) {
        const svg = productPageBtn.querySelector('svg');
        const textSpan = productPageBtn.querySelector('.btn-text');
        if (svg && textSpan) {
            if (isFavorite) {
                svg.innerHTML = '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>';
                textSpan.textContent = 'В избранном';
                productPageBtn.classList.add('active');
            } else {
                svg.innerHTML = '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>';
                textSpan.textContent = 'В избранное';
                productPageBtn.classList.remove('active');
            }
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
        
        // Обновляем все кнопки корзины на странице
        await updateAllCartButtons(cart);
    } catch (error) {
        console.error('Ошибка обновления счетчика:', error);
    }
}

// Обновление всех кнопок корзины на странице
async function updateAllCartButtons(cartItems) {
    if (!cartItems) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        try {
            const response = await fetch(`${api.baseURL}/cart/${currentUser.id}`);
            cartItems = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            return;
        }
    }
    
    // Обновляем все кнопки add-to-cart на странице
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.productId || btn.dataset.id);
        if (!productId) return;
        
        const cartItem = cartItems.find(item => item.id == productId);
        if (cartItem && cartItem.quantity > 0) {
            updateAddToCartButton(productId, cartItem.quantity);
        } else {
            updateAddToCartButton(productId, 0);
        }
    });
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
            const svg = btn.querySelector('svg');
            if (svg) {
                if (favoriteIds.includes(productId)) {
                    svg.innerHTML = '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>';
                    btn.classList.add('active');
                } else {
                    svg.innerHTML = '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>';
                    btn.classList.remove('active');
                }
            }
        });
        
        // Обновляем кнопку на странице товара
        const productPageBtn = document.getElementById('favorite-btn');
        if (productPageBtn) {
            const productId = parseInt(productPageBtn.dataset.id);
            const svg = productPageBtn.querySelector('svg');
            const textSpan = productPageBtn.querySelector('.btn-text');
            if (svg && textSpan) {
                if (favoriteIds.includes(productId)) {
                    svg.innerHTML = '<path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>';
                    textSpan.textContent = 'В избранном';
                    productPageBtn.classList.add('active');
                } else {
                    svg.innerHTML = '<path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>';
                    textSpan.textContent = 'В избранное';
                    productPageBtn.classList.remove('active');
                }
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
