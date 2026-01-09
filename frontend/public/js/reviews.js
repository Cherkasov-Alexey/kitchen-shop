// Система отзывов
document.addEventListener('DOMContentLoaded', function() {
    initReviews();
});

function initReviews() {
    const productId = new URLSearchParams(window.location.search).get('id');
    if (!productId) return;
    
    // Проверяем авторизацию
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const reviewFormContainer = document.getElementById('review-form-container');
    
    if (!currentUser) {
        // Показываем сообщение о необходимости входа
        reviewFormContainer.innerHTML = `
            <div class="login-prompt">
                <p>Войдите в аккаунт, чтобы оставить отзыв</p>
                <a href="login.html">Войти</a>
            </div>
        `;
    } else {
        // Инициализируем форму отзыва
        initReviewForm(productId, currentUser);
    }
    
    // Загружаем и отображаем отзывы
    loadReviews(productId);
}

function initReviewForm(productId, user) {
    const starsInput = document.querySelectorAll('.stars-input .star');
    const ratingValue = document.getElementById('rating-value');
    const reviewForm = document.getElementById('review-form');
    
    // Обработка выбора рейтинга
    starsInput.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingValue.value = rating;
            
            // Обновляем визуальное отображение звезд
            starsInput.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        });
        
        // Hover эффект
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            starsInput.forEach((s, index) => {
                if (index < rating) {
                    s.textContent = '★';
                } else {
                    s.textContent = '☆';
                }
            });
        });
    });
    
    // Восстановление звезд при уходе мыши
    document.querySelector('.stars-input').addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingValue.value);
        starsInput.forEach((s, index) => {
            if (index < currentRating) {
                s.textContent = '★';
                s.classList.add('active');
            } else {
                s.textContent = '☆';
                s.classList.remove('active');
            }
        });
    });
    
    // Обработка отправки формы
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rating = parseInt(ratingValue.value);
        const reviewText = document.getElementById('review-text').value.trim();
        
        if (rating === 0) {
            showNotification('Пожалуйста, поставьте оценку');
            return;
        }
        
        if (!reviewText) {
            showNotification('Пожалуйста, напишите отзыв');
            return;
        }
        
        // Отправляем отзыв на сервер
        try {
            const response = await fetch(`${API_BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    product_id: parseInt(productId),
                    rating: rating,
                    text: reviewText
                })
            });
            
            if (!response.ok) {
                throw new Error('Ошибка отправки отзыва');
            }
            
            // Очищаем форму
            reviewForm.reset();
            ratingValue.value = 0;
            starsInput.forEach(s => {
                s.textContent = '☆';
                s.classList.remove('active');
            });
            
            showNotification('Спасибо за ваш отзыв!');
            
            // Перезагружаем список отзывов
            loadReviews(productId);
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
            showNotification('Ошибка отправки отзыва. Попробуйте позже.');
        }
    });
}

async function loadReviews(productId) {
    const reviewsList = document.getElementById('reviews-list');
    
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${productId}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки отзывов');
        }
        
        const reviews = await response.json();
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="no-reviews">Пока нет отзывов. Будьте первым!</p>';
            return;
        }
        
        // Отображаем отзывы
        reviewsList.innerHTML = reviews.map(review => {
            const date = new Date(review.created_at);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const stars = generateStars(review.rating);
            
            return `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-author">
                            <span class="review-author-name">${escapeHtml(review.user_name)}</span>
                            <span class="review-date">${formattedDate}</span>
                        </div>
                        <div class="review-rating">
                            ${stars}
                        </div>
                    </div>
                    <div class="review-text">${escapeHtml(review.text)}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        reviewsList.innerHTML = '<p class="no-reviews">Ошибка загрузки отзывов</p>';
    }
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star">★</span>';
        } else {
            stars += '<span class="star empty">☆</span>';
        }
    }
    return stars;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
