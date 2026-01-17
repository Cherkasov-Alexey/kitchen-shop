document.addEventListener('DOMContentLoaded', async function() {
    await loadProductData();
    initProductGallery();
    setupProductEvents();
    await loadRelatedProducts();
    await checkCartStatus();
});

// Загрузка данных товара по ID из URL
async function loadProductData() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        console.error('ID товара не найден в URL');
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки товара');
        }
        
        const product = await response.json();
        window.currentProduct = product; // Сохраняем для доступа из других функций
        displayProduct(product);
        
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        document.body.innerHTML = '<div class="error">Товар не найден</div>';
    }
}

// Отображение данных товара на странице
function displayProduct(product) {
    // Обновляем ссылку "назад к каталогу" с категорией товара
    const backLink = document.getElementById('back-to-catalog');
    if (backLink && product.category_id) {
        backLink.href = `catalog.html?category=${product.category_id}`;
    }
    
    // Обновляем название товара
    const nameElement = document.getElementById('product-name');
    if (nameElement) {
        nameElement.textContent = product.name || product.product_name;
    }
    
    // Обновляем описание
    const descriptionElement = document.querySelector('.product-description');
    if (descriptionElement && product.description) {
        descriptionElement.innerHTML = `<p>${product.description.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }
    
    // Обновляем характеристики
    const specificationsElement = document.querySelector('.product-specifications');
    if (specificationsElement && product.specifications) {
        const specsHTML = product.specifications.split('\n').map(line => line.trim()).filter(line => line).map(line => `<li>${line}</li>`).join('');
        specificationsElement.innerHTML = `<ul>${specsHTML}</ul>`;
    }
    
    // Обновляем информацию о доставке и гарантии
    const deliveryElement = document.querySelector('.product-delivery');
    if (deliveryElement && product.warranty) {
        const warrantyLines = product.warranty.split('\n').map(line => line.trim()).filter(line => line).join('<br>');
        deliveryElement.innerHTML = `<p>${warrantyLines}</p>`;
    }
    
    // Обновляем цену
    const priceElement = document.getElementById('product-price');
    if (priceElement) {
        priceElement.textContent = formatPrice(product.price);
    }
    
    // Обновляем старую цену если есть
    if (product.old_price) {
        const oldPrice = document.createElement('span');
        oldPrice.id = 'product-old-price';
        oldPrice.style.textDecoration = 'line-through';
        oldPrice.style.fontSize = '20px';
        oldPrice.style.color = '#64748b';
        oldPrice.style.marginLeft = '10px';
        oldPrice.textContent = formatPrice(product.old_price);
        priceElement.parentElement.insertBefore(oldPrice, priceElement.nextSibling);
    }
    
    // Обновляем галерею изображений
    if (product.images && product.images.length > 0) {
        const mainImage = document.getElementById('product-main-image');
        if (mainImage) {
            mainImage.src = product.images[0] + '?v=2';
            mainImage.alt = product.name || product.product_name;
            // Добавляем обработчик клика для открытия lightbox
            mainImage.style.cursor = 'pointer';
            mainImage.onclick = () => openLightbox(product.images, 0);
        }
        
        const thumbsContainer = document.getElementById('gallery-thumbs');
        if (thumbsContainer) {
            thumbsContainer.innerHTML = product.images.map((img, index) => 
                `<img src="${img}?v=2" alt="${product.name} ${index + 1}" class="${index === 0 ? 'thumb-active' : ''}" onclick="changeMainImage('${img}', '${product.name}', ${index})">`
            ).join('');
        }
    }
    
    // Обновляем данные для кнопок
    const favoriteBtn = document.getElementById('favorite-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (favoriteBtn) {
        favoriteBtn.dataset.id = product.id;
        favoriteBtn.dataset.name = product.product_name;
        favoriteBtn.dataset.price = product.price;
    }
    if (addToCartBtn) {
        addToCartBtn.dataset.id = product.id;
        addToCartBtn.dataset.name = product.product_name;
        addToCartBtn.dataset.price = product.price;
    }
    
    // Обновляем состояние кнопки избранного из базы данных
    if (typeof updateAllFavoriteButtons !== 'undefined') {
        updateAllFavoriteButtons();
    }
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

// Инициализация галереи товара
function initProductGallery() {
    const thumbs = document.querySelectorAll('#gallery-thumbs img');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            changeMainImage(this.src, this.alt);
        });
    });
}

// Смена основного изображения
function changeMainImage(src, alt, index = 0) {
    const mainImage = document.getElementById('product-main-image');
    if (mainImage) {
        mainImage.src = src + '?v=2';
        if (alt) {
            mainImage.alt = alt;
        }
        
        // Обновляем обработчик клика с правильным индексом
        const product = window.currentProduct;
        if (product && product.images) {
            mainImage.onclick = () => openLightbox(product.images, index);
        }
        
        const thumbs = document.querySelectorAll('#gallery-thumbs img');
        thumbs.forEach(thumb => {
            thumb.classList.remove('thumb-active');
            if (thumb.src.includes(src)) {
                thumb.classList.add('thumb-active');
            }
        });
    }
}

// Настройка обработчиков событий товара
function setupProductEvents() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn && productId) {
        // Устанавливаем оба атрибута для совместимости
        addToCartBtn.dataset.id = productId;
        addToCartBtn.dataset.productId = productId;
        addToCartBtn.addEventListener('click', function() {
            const prodId = parseInt(this.dataset.id);
            
            if (typeof addToCart !== 'undefined') {
                addToCart(prodId);
            }
        });
    }

    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
            const product = {
                id: parseInt(this.dataset.id),
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: document.getElementById('product-main-image').src
            };
            
            if (typeof addToFavorites !== 'undefined') {
                addToFavorites(product);
                this.textContent = '♥ В избранном';
                this.style.backgroundColor = '#ec4899';
            }
        });
    }
}

// Переход на страницу товара
function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Загрузка похожих товаров
async function loadRelatedProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentProductId = parseInt(urlParams.get('id'));
    
    const container = document.getElementById('related-products');
    if (!container) return;
    
    try {
        const response = await fetch('/api/products?limit=10');
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        
        const data = await response.json();
        let products = data.products || data; // Поддержка нового и старого формата API
        
        // Исключаем текущий товар и берем первые 3
        products = products.filter(p => p.id !== currentProductId).slice(0, 3);
        
        if (products.length === 0) {
            container.innerHTML = '<p>Нет похожих товаров</p>';
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="product-card related-card" data-product-id="${product.id}">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'images/placeholder.jpg'}" alt="${product.product_name}">
                <h4>${product.product_name}</h4>
                <span class="price">${formatPrice(product.price)}</span>
            </div>
        `).join('');
        
        // Добавляем обработчики кликов после рендера
        container.querySelectorAll('.related-card').forEach(card => {
            card.addEventListener('click', function() {
                const productId = this.dataset.productId;
                window.location.href = `product.html?id=${productId}`;
            });
        });
        
    } catch (error) {
        console.error('Ошибка загрузки похожих товаров:', error);
        container.innerHTML = '<p>Ошибка загрузки</p>';
    }
}

// Проверка статуса товара в корзине
async function checkCartStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
        const cartItems = await response.json();
        const item = cartItems.find(i => i.id == productId);
        
        if (item && item.quantity > 0) {
            updateAddToCartButton(productId, item.quantity);
        }
    } catch (error) {
        console.error('Ошибка проверки корзины:', error);
    }
}

// Делаем функции доступными глобально
window.goToProduct = goToProduct;
window.changeMainImage = changeMainImage;

// ===== LIGHTBOX ДЛЯ ПРОСМОТРА ИЗОБРАЖЕНИЙ =====
let currentImageIndex = 0;
let productImages = [];

function openLightbox(images, startIndex = 0) {
    productImages = images;
    currentImageIndex = startIndex;
    
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.id = 'lightbox';
    
    overlay.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
            <button class="lightbox-arrow prev" onclick="prevImage()">&#8249;</button>
            <img src="${productImages[currentImageIndex]}?v=2" alt="Изображение товара">
            <button class="lightbox-arrow next" onclick="nextImage()">&#8250;</button>
            <div class="lightbox-counter">${currentImageIndex + 1} / ${productImages.length}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Закрытие по клику на фон
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });
    
    // Управление клавиатурой
    document.addEventListener('keydown', handleKeyPress);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyPress);
    }
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
    updateLightboxImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const img = lightbox.querySelector('img');
        const counter = lightbox.querySelector('.lightbox-counter');
        img.src = productImages[currentImageIndex] + '?v=2';
        counter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    }
}

function handleKeyPress(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    }
}

// Делаем функции глобальными
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;
