// Глобальная конфигурация API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

console.log('API_BASE_URL:', API_BASE_URL);

// Функция для форматирования даты в московском времени
function formatMoscowDate(dateString) {
    if (!dateString) return 'Неизвестно';
    
    const utcDate = new Date(dateString);
    
    // Используем timeZone: 'Europe/Moscow' для автоматической конвертации
    return utcDate.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/Moscow'
    });
}

// Функция для форматирования даты и времени в московском времени
function formatMoscowDateTime(dateString) {
    if (!dateString) return 'Неизвестно';
    
    const utcDate = new Date(dateString);
    
    return utcDate.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow'
    });
}