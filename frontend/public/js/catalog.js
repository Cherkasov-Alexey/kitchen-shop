// Каталог товаров
document.addEventListener('DOMContentLoaded', async () => {
    await loadCatalogCategories();
    
    // Проверяем параметр category в URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');
    
    await loadCatalogProducts(categoryId);
    initFilters();
    
    // Обновляем счетчик корзины и кнопки при загрузке
    if (typeof updateCartCount !== 'undefined') {
        await updateCartCount();
    }
});

// Загрузка категорий для фильтрации
async function loadCatalogCategories() {
    const container = document.getElementById('categories-menu');
    if (!container) return;
    
    try {
        const categories = await api.getCategories();
        
        // Фильтруем только обычные категории (без 'товары со скидкой')
        const regularCategories = categories.filter(cat => cat.category_name !== 'товары со скидкой');

        // Получаем активную категорию из URL
        const urlParams = new URLSearchParams(window.location.search);
        const activeCategoryId = urlParams.get('category');

        let html = `<li><button class="category-btn ${!activeCategoryId ? 'active' : ''}" data-category="all">Все товары</button></li>`;
        regularCategories.forEach(category => {
            const isActive = activeCategoryId == category.id ? 'active' : '';
            html += `<li><button class="category-btn ${isActive}" data-category="${category.id}">${category.category_name}</button></li>`;
        });

        container.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        container.innerHTML = '<li>Ошибка загрузки категорий</li>';
    }
}

// Загрузка всех товаров
async function loadCatalogProducts(categoryId = null) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const params = {};
        if (categoryId && categoryId !== 'all') {
            params.category_id = categoryId;
        }
        
        const products = await api.getProducts(params);
        
        if (products.length === 0) {
            container.innerHTML = '<p class="no-products">Товары не найдены</p>';
            return;
        }

        container.innerHTML = products.map(product => 
            UIUtils.createProductCard(product)
        ).join('');
        
        // Обновляем состояние кнопок избранного после рендера
        if (typeof updateAllFavoriteButtons !== 'undefined') {
            updateAllFavoriteButtons();
        }
        
        // Обновляем состояние кнопок корзины после рендера
        if (typeof updateAllCartButtons !== 'undefined') {
            await updateAllCartButtons();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        UIUtils.showError(container, 'Ошибка загрузки товаров');
    }
}

// Инициализация фильтров
function initFilters() {
    // Фильтр по категориям
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            // Убираем активный класс со всех кнопок
            document.querySelectorAll('.category-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            
            // Добавляем активный класс на нажатую кнопку
            e.target.classList.add('active');
            
            // Загружаем товары по категории
            const categoryId = e.target.dataset.category;
            loadCatalogProducts(categoryId);
        }
    });
    
    // Поиск
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchProducts(e.target.value);
            }, 500);
        });
    }
}

// Поиск товаров
async function searchProducts(query) {
    if (!query.trim()) {
        loadCatalogProducts();
        return;
    }
    
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const products = await api.getProducts();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '<p class="no-products">Товары не найдены</p>';
            return;
        }

        container.innerHTML = filteredProducts.map(product => 
            UIUtils.createProductCard(product)
        ).join('');
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        UIUtils.showError(container, 'Ошибка поиска');
    }
}