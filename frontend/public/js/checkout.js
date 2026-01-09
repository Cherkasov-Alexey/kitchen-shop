document.addEventListener('DOMContentLoaded', function() {
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
            alert('Необходимо войти в аккаунт');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Проверяем корзину из базы данных
            const cartResponse = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
            const cart = await cartResponse.json();
            
            if (cart.length === 0) {
                alert('Корзина пуста! Добавьте товары для оформления заказа.');
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
                alert('Пожалуйста, заполните все обязательные поля (помечены *)');
                return;
            }
            
            // Валидация телефона (простая проверка)
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
                alert('Введите корректный номер телефона');
                return;
            }
            
            // Валидация email (если указан)
            if (formData.email && !isValidEmail(formData.email)) {
                alert('Введите корректный email адрес');
                return;
            }
            
            // Подтверждение заказа
            if (confirm('Подтвердить оформление заказа?')) {
                await processOrder(formData, cart);
            }
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert('Произошла ошибка. Попробуйте позже.');
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
        const orderResponse = await fetch('${API_BASE_URL}/orders', {
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
        alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    }
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