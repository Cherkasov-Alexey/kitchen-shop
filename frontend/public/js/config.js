// Глобальная конфигурация API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

console.log('API_BASE_URL:', API_BASE_URL);
// Функция для форматирования даты в московском времени
function formatMoscowDate(dateString) {
    const date = new Date(dateString);
    // Получаем время в миллисекундах UTC
    const utcTime = date.getTime();
    // Добавляем 3 часа (UTC+3) в миллисекундах
    const moscowTime = new Date(utcTime + (3 * 60 * 60 * 1000));
    // Форматируем дату
    return moscowTime.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Используем UTC, так как мы уже добавили смещение
    });
}