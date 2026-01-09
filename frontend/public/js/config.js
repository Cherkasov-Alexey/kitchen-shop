// Глобальная конфигурация API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

console.log('API_BASE_URL:', API_BASE_URL);
