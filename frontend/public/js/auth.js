document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showError('Заполните все поля');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    showError(data.error || 'Ошибка входа');
                    return;
                }
                
                // Сохраняем пользователя в localStorage
                localStorage.setItem('currentUser', JSON.stringify(data));
                
                // Перенаправляем на главную
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Ошибка входа:', error);
                showError('Ошибка соединения с сервером');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!name || !email || !password) {
                showError('Заполните все поля');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    showError(data.error || 'Ошибка регистрации');
                    return;
                }
                
                // Сохраняем пользователя в localStorage
                localStorage.setItem('currentUser', JSON.stringify(data));
                
                // Перенаправляем на главную
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Ошибка регистрации:', error);
                showError('Ошибка соединения с сервером');
            }
        });
    }
    
    // Функция выхода
    const logoutButtons = document.querySelectorAll('.logout');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    });
});

function showError(message) {
    const errorElement = document.getElementById('error-msg') || createErrorElement();
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

function createErrorElement() {
    const errorElement = document.createElement('p');
    errorElement.id = 'error-msg';
    errorElement.className = 'error';
    errorElement.style.cssText = `
        color: #f87171;
        margin-top: 10px;
        display: none;
    `;
    
    const form = document.querySelector('.auth-form');
    if (form) {
        form.appendChild(errorElement);
    }
    
    return errorElement;
}

// Проверка авторизации при загрузке страницы
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const body = document.body;
    const guestElements = document.querySelectorAll('.auth-actions.guest');
    const userElements = document.querySelectorAll('.auth-actions.user');
    
    if (currentUser) {
        body.classList.add('authenticated');
        guestElements.forEach(el => el.style.display = 'none');
        userElements.forEach(el => el.style.display = 'flex');
        
        // Показываем имя пользователя
        const profileLinks = document.querySelectorAll('a[href="profile.html"]');
        profileLinks.forEach(link => {
            link.textContent = currentUser.user_name;
        });
        
        console.log('Пользователь авторизован:', currentUser.user_name);
    } else {
        guestElements.forEach(el => el.style.display = 'flex');
        userElements.forEach(el => el.style.display = 'none');
        console.log('Пользователь не авторизован');
    }
}