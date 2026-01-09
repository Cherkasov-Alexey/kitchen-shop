document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    setupCheckoutButton();
    // Настраиваем делегирование событий один раз
    setupCartEventListenersOnce();
});

// Глобальный флаг для предотвращения множественной установки обработчиков
let cartListenersSetup = false;

function setupCartEventListenersOnce() {
    if (cartListenersSetup) return;
    cartListenersSetup = true;
    
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return;
    
    // Делегирование событий на контейнер корзины
    cartContainer.addEventListener('click', async function(e) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Удаление товара
        if (e.target.classList.contains('remove')) {
            const productId = e.target.dataset.id;
            
            try {
                await fetch(`${API_BASE_URL}/cart/${currentUser.id}/${productId}`, {
                    method: 'DELETE'
                });
                
                // Обновляем счетчик корзины
                if (typeof updateCartCount !== 'undefined') {
                    await updateCartCount();
                }
                
                // Перерендериваем корзину
                renderCart();
            } catch (error) {
                console.error('Ошибка удаления товара:', error);
            }
            return;
        }
        
        // Увеличение количества
        if (e.target.classList.contains('plus')) {
            const productId = e.target.dataset.id;
            const cartItem = e.target.closest('.cart-item');
            const quantitySpan = cartItem.querySelector('.quantity');
            const currentQuantity = parseInt(quantitySpan.textContent);
            
            try {
                await fetch('${API_BASE_URL}/cart', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentUser.id,
                        product_id: productId,
                        quantity: currentQuantity + 1
                    })
                });
                
                quantitySpan.textContent = currentQuantity + 1;
                await updateCartCount();
                await updateCartTotal();
            } catch (error) {
                console.error('Ошибка увеличения количества:', error);
            }
            return;
        }
        
        // Уменьшение количества
        if (e.target.classList.contains('minus')) {
            const productId = e.target.dataset.id;
            const cartItem = e.target.closest('.cart-item');
            const quantitySpan = cartItem.querySelector('.quantity');
            const currentQuantity = parseInt(quantitySpan.textContent);
            
            try {
                if (currentQuantity > 1) {
                    await fetch('${API_BASE_URL}/cart', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: currentUser.id,
                            product_id: productId,
                            quantity: currentQuantity - 1
                        })
                    });
                    
                    quantitySpan.textContent = currentQuantity - 1;
                    await updateCartCount();
                    await updateCartTotal();
                } else {
                    // Удаляем товар, если количество = 1
                    await fetch(`${API_BASE_URL}/cart/${currentUser.id}/${productId}`, {
                        method: 'DELETE'
                    });
                    
                    // Обновляем счетчик корзины
                    if (typeof updateCartCount !== 'undefined') {
                        await updateCartCount();
                    }
                    
                    // Перерендериваем корзину
                    renderCart();
                }
            } catch (error) {
                console.error('Ошибка уменьшения количества:', error);
            }
        }
    });
}

async function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!cartContainer) return;
    
    // Удаляем все существующие товары и сообщения, кроме cart-summary и checkout-btn
    const itemsToRemove = cartContainer.querySelectorAll('.cart-item, .cart-empty');
    itemsToRemove.forEach(item => item.remove());
    
    if (!currentUser) {
        // Проверяем, нет ли уже сообщения
        if (!cartContainer.querySelector('.cart-empty')) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'cart-empty';
            emptyMessage.innerHTML = `
                <p style="margin-bottom: 15px; font-size: 18px;">Войдите в аккаунт, чтобы увидеть корзину</p>
                <a href="login.html" style="color: #38bdf8; text-decoration: none;">Войти</a>
            `;
            cartContainer.insertBefore(emptyMessage, cartContainer.querySelector('.cart-summary'));
        }
        updateCartTotal();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
        const cart = await response.json();
        
        // Если корзина пуста
        if (cart.length === 0) {
            // Проверяем, нет ли уже сообщения
            if (!cartContainer.querySelector('.cart-empty')) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'cart-empty';
                emptyMessage.innerHTML = `
                    <p style="margin-bottom: 15px; font-size: 18px;">Ваша корзина пуста</p>
                    <a href="catalog.html" style="color: #38bdf8; text-decoration: none;">Перейти в каталог</a>
                `;
                cartContainer.insertBefore(emptyMessage, cartContainer.querySelector('.cart-summary'));
            }
            
            // Обновляем итоговую сумму
            updateCartTotal();
            return;
        }
        
        // Рендерим каждый товар из корзины
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            
            cartItem.innerHTML = `
                <img src="${item.image_url || item.images?.split(',')[0] || ''}" alt="${item.product_name}" style="width: 80px; height: 80px; object-fit: contain;">
                <div class="cart-info">
                    <h3>${item.product_name}</h3>
                    <p>Артикул: SC-${item.id.toString().padStart(3, '0')}</p>
                    <span class="price">${(item.price || 0).toLocaleString()} ₽</span>
                    <div class="quantity-controls" style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                        <button class="quantity-btn minus" data-id="${item.id}" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); background: transparent; color: white; cursor: pointer;">-</button>
                        <span class="quantity" style="min-width: 30px; text-align: center;">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); background: transparent; color: white; cursor: pointer;">+</button>
                    </div>
                </div>
                <button class="remove" data-id="${item.id}" style="background: none; border: none; font-size: 22px; color: #f87171; cursor: pointer;">✕</button>
            `;
            
            // Вставляем перед блоком итого
            const summaryElement = cartContainer.querySelector('.cart-summary');
            cartContainer.insertBefore(cartItem, summaryElement);
        });
        
        // Обновляем итоговую сумму
        updateCartTotal();
        
        // НЕ вызываем setupCartEventListeners - используем делегирование
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

async function updateCartTotal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = '0 ₽';
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
        const cart = await response.json();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = total.toLocaleString() + ' ₽';
        }
    } catch (error) {
        console.error('Ошибка обновления итога:', error);
    }
}

// Старая функция удалена - теперь используем делегирование событий

async function setupCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Войдите в аккаунт для оформления заказа.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
                const cart = await response.json();
                
                if (cart.length === 0) {
                    alert('Корзина пуста. Добавьте товары для оформления заказа.');
                    return;
                }
                
                window.location.href = 'checkout.html';
            } catch (error) {
                console.error('Ошибка проверки корзины:', error);
            }
        });
    }
}