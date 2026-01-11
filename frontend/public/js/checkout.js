document.addEventListener('DOMContentLoaded', function() {
    // Показать кнопки профиля и выхода для авторизованных пользователей
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const authButtons = document.getElementById('auth-buttons');
        if (authButtons) {
            authButtons.style.display = 'flex';
        }
    }
    
    // Обработчик выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    renderOrderSummary();
    setupPaymentMethods();
    setupFormSubmit();
});

async function renderOrderSummary() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
        const cart = await response.json();
        
        const summaryElement = document.getElementById('order-summary');
        const totalElement = document.getElementById('order-total');
        
        if (summaryElement && cart.length > 0) {
            summaryElement.innerHTML = cart.map(item => `
                <div class="order-item">
                    <span>${item.product_name} x${item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (totalElement) {
                totalElement.textContent = total.toLocaleString() + ' ₽';
            }
        } else if (summaryElement) {
            summaryElement.innerHTML = '<p>Корзина пуста</p>';
            if (totalElement) totalElement.textContent = '0 ₽';
            
            // Блокируем оформление заказа
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Корзина пуста';
                submitBtn.style.opacity = '0.5';
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
}

function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentInput = document.getElementById('payment');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Убираем выделение у всех
            paymentMethods.forEach(m => m.classList.remove('selected'));
            // Выделяем текущий
            this.classList.add('selected');
            // Устанавливаем значение
            paymentInput.value = this.dataset.value;
        });
    });
    
    // Выбираем карту по умолчанию
    if (paymentMethods.length > 0) 
    {
        document.querySelector('.payment-method[data-value="card"]').classList.add('selected');
    }   
}

function setupFormSubmit() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;
    
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            showNotification('Необходимо войти в аккаунт', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        try {
            // Проверяем корзину из базы данных
            const cartResponse = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
            const cart = await cartResponse.json();
            
            if (cart.length === 0) {
                showNotification('Корзина пуста! Добавьте товары для оформления заказа.', 'error');
                return;
            }
            
            // Собираем данные формы
            const formData = {
                name: document.getElementById('name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                address: document.getElementById('address').value.trim(),
                payment: document.getElementById('payment').value,
                comment: document.getElementById('comment').value.trim()
            };
            
            // Валидация
            if (!formData.name || !formData.phone || !formData.address) {
                showNotification('Пожалуйста, заполните все обязательные поля (помечены *)', 'error');
                return;
            }
            
            // Валидация телефона (простая проверка)
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
                showNotification('Введите корректный номер телефона', 'error');
                return;
            }
            
            // Валидация email (если указан)
            if (formData.email && !isValidEmail(formData.email)) {
                showNotification('Введите корректный email адрес', 'error');
                return;
            }
            
            // Подтверждение заказа
            showConfirmModal('Подтвердить оформление заказа?', async () => {
                await processOrder(formData, cart);
            });
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            showNotification('Произошла ошибка. Попробуйте позже.', 'error');
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function processOrder(formData, cart) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Рассчитываем общую сумму заказа
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        // Создаем заказ в базе данных
        const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                    user_id: currentUser.id,
                    total: total,
                    delivery_address: formData.address,
                    payment_method: formData.payment,
                    comment: formData.comment,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    customer_email: formData.email
                })
        });

        if (!orderResponse.ok) {
            throw new Error('Ошибка создания заказа');
        }

        const order = await orderResponse.json();

        // Очищаем корзину в базе данных
        await fetch(`${API_BASE_URL}/cart/${currentUser.id}`, {
            method: 'DELETE'
        });

        // Обновляем счетчик корзины
        if (typeof updateCartCount !== 'undefined') {
            updateCartCount();
        }

        // Перенаправляем на страницу успеха
        window.location.href = `order-success.html?id=${order.id}`;
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        showNotification('Произошла ошибка при оформлении заказа. Попробуйте еще раз.', 'error');
    }
}

// Функция для показа модального окна подтверждения
function showConfirmModal(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal-overlay';
    modal.innerHTML = `
        <div class="confirm-modal">
            <h3>Подтверждение</h3>
            <p>${message}</p>
            <div class="confirm-modal-actions">
                <button class="modal-btn modal-cancel" onclick="closeConfirmModal()">Отмена</button>
                <button class="modal-btn modal-confirm" id="confirm-btn">Подтвердить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('confirm-btn').onclick = () => {
        closeConfirmModal();
        onConfirm();
    };
    
    // Закрытие по клику на overlay
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeConfirmModal();
        }
    };
}

function closeConfirmModal() {
    const modal = document.querySelector('.confirm-modal-overlay');
    if (modal) modal.remove();
}

// Функция для показа уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #38bdf8, #a78bfa)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => {
        el.textContent = totalCount;
    });
}