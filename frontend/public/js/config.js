// Глобальная конфигурация API
const API_BASE_URL = `${window.location.origin}/api`;

console.log('API_BASE_URL:', API_BASE_URL);

// Функция для форматирования даты в московском времени (UTC+3)
function formatMoscowDate(dateString) {
    if (!dateString) return 'Неизвестно';
    
    const utcDate = new Date(dateString);
    // Добавляем 3 часа (UTC+3) - 3 * 60 * 60 * 1000 миллисекунд
    const moscowDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
    
    return moscowDate.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Функция для форматирования даты и времени в московском времени
function formatMoscowDateTime(dateString) {
    if (!dateString) return 'Неизвестно';
    
    const utcDate = new Date(dateString);
    const moscowDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
    
    return moscowDate.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}