// Страница акций
document.addEventListener('DOMContentLoaded', async () => {
    await loadSaleProducts();
    
    // Обновляем счетчик корзины и кнопки при загрузке
    if (typeof updateCartCount !== 'undefined') {
        await updateCartCount();
    }
});

// Загрузка товаров со скидками
async function loadSaleProducts() {
    const container = document.getElementById('sales-products');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const response = await api.getProducts({ sale: 'true', limit: 3 });
        const products = response.products || response; // Поддержка старого и нового формата
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="no-sales">
                    <h2>🎁 Акций пока нет</h2>
                    <p>Следите за обновлениями - скоро появятся выгодные предложения!</p>
                    <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => 
            UIUtils.createProductCard(product)
        ).join('');
        
        // Обновляем кнопки избранного после загрузки товаров
        if (typeof updateAllFavoriteButtons !== 'undefined') {
            await updateAllFavoriteButtons();
        }
        
        // Обновляем состояние кнопок корзины после рендера
        if (typeof updateAllCartButtons !== 'undefined') {
            await updateAllCartButtons();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки акций:', error);
        UIUtils.showError(container, 'Ошибка загрузки акций');
    }
}