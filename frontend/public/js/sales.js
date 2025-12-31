// Страница акций
document.addEventListener('DOMContentLoaded', async () => {
    await loadSaleProducts();
});

// Загрузка товаров со скидками
async function loadSaleProducts() {
    const container = document.getElementById('sales-products');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const products = await api.getProducts({ sale: 'true', limit: 3 });
        
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
        
    } catch (error) {
        console.error('Ошибка загрузки акций:', error);
        UIUtils.showError(container, 'Ошибка загрузки акций');
    }
}