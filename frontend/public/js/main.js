// Главная страница - новая версия
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadFeaturedProducts();
    initAuth();
});

// Загрузка категорий в виде простых кнопок
async function loadCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const categories = await api.getCategories();
        
        if (categories.length === 0) {
            UIUtils.showError(container, 'Категории не найдены');
            return;
        }

        // Сортируем: "товары со скидкой" в конец
        const sortedCategories = categories.sort((a, b) => {
            if (a.category_name === 'товары со скидкой') return 1;
            if (b.category_name === 'товары со скидкой') return -1;
            return 0;
        });

        container.innerHTML = sortedCategories.map(category => 
            UIUtils.createCategoryButton(category)
        ).join('');
        
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        UIUtils.showError(container);
    }
}

// Загрузка популярных товаров
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    UIUtils.showLoading(container);
    
    try {
        const products = await api.getProducts({ featured: true, limit: 3 });
        
        if (products.length === 0) {
            UIUtils.showError(container, 'Популярные товары не найдены');
            return;
        }

        container.innerHTML = products.map(product => 
            UIUtils.createProductCard(product)
        ).join('');
        
        // Обновляем состояние кнопок избранного после рендера
        if (typeof updateAllFavoriteButtons !== 'undefined') {
            updateAllFavoriteButtons();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        UIUtils.showError(container);
    }
}

// Инициализация авторизации
function initAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        // Обновляем имя пользователя
        const profileLinks = document.querySelectorAll('a[href="profile.html"]');
        profileLinks.forEach(link => link.textContent = user.user_name);
    }
    // Обработчик выхода
    document.querySelectorAll('.logout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    });
}