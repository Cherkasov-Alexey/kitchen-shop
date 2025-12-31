let cart = [];

async function updateCartCount() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const countElement = document.getElementById('cart-count');
    
    if (!countElement) return;
    
    if (!currentUser) {
        countElement.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/cart/${currentUser.id}`);
        cart = await response.json();
        
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalCount;
        countElement.style.display = totalCount > 0 ? 'inline-block' : 'none';
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
        countElement.style.display = 'none';
    }
}

async function removeFromCart(productId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
        await fetch(`http://localhost:3000/api/cart/${currentUser.id}/${productId}`, {
            method: 'DELETE'
        });
        
        await updateCartCount();
        if (typeof renderCart !== 'undefined') {
            renderCart();
        }
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
    }
}

function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(90deg, #a855f7, #ec4899);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', updateCartCount);

// Делаем функции доступными глобально
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartCount = updateCartCount;
