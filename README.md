# SmartCook - Интернет-магазин кухонной техники

[![Production](https://img.shields.io/badge/production-live-brightgreen)](https://kitchen-shop-l4jl.onrender.com)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/postgresql-18-blue)](https://www.postgresql.org)

## Описание

Современный интернет-магазин кухонной техники с полным функционалом e-commerce: авторизация, корзина, избранное, оформление заказов и система отзывов.

** Демо **: [kitchen-shop-l4jl.onrender.com](https://kitchen-shop-l4jl.onrender.com)

## Технологии

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Адаптивный дизайн
- Динамическая загрузка контента

### Backend
- Node.js + Express.js
- RESTful API
- bcrypt для хеширования паролей
- CORS для кросс-доменных запросов

### База данных
- PostgreSQL 18
- Нормализованная структура (8 таблиц)
- Ограничения целостности (foreign keys, unique constraints)

### Деплой
- Render.com (Frankfurt region)
- Auto-deploy из GitHub
- Managed PostgreSQL с SSL

## Функциональность

### Для пользователей
- **Регистрация и авторизация** - безопасное хранение паролей (bcrypt)
- **Корзина** - добавление, удаление, изменение количества
- **Избранное** - сохранение понравившихся товаров
- **Оформление заказов** - с указанием контактных данных
- **Система отзывов** - рейтинг от 1 до 5 звезд
- **Категории** - Холодильники, Кофемашины, Посудомоечные машины
- **Скидки** - специальный раздел "Товары со скидкой"
- **Профиль пользователя** - история заказов
- **Адаптивный дизайн** - работает на всех устройствах
- **Лайтбокс** - полноэкранный просмотр изображений товаров

### Технические особенности
- **SPA-подобная навигация** - динамическая загрузка без перезагрузки
- **REST API** - чистая архитектура backend
- **Нормализованная БД** - foreign keys, unique constraints, cascades
- **Автоматическое определение окружения** - localhost vs production API

## Структура проекта

```
kitchen-shop/
├── backend/
│   └── src/
│       ├── index.js          # Express сервер + API endpoints
│       └── db-adapter.js     # PostgreSQL адаптер с SSL
├── database/
│   └── schema_pg.sql         # Схема базы данных (8 таблиц)
├── frontend/
│   └── public/
│       ├── css/              # Стили
│       ├── js/               # JavaScript модули
│       ├── images/           # Изображения товаров
│       └── *.html            # 13 HTML страниц
├── db-render.js              # Скрипт для просмотра Render БД
├── package.json
├── render.yaml               # Конфигурация Render деплоя
└── README.md
```

## База данных

### Структура (8 таблиц)
- **users** - пользователи (id, user_name, email, password_hash, created_at)
- **categories** - категории товаров
- **products** - товары с ценами и описаниями
- **cart** - корзина покупок (user_id + product_id + quantity)
- **favorites** - избранные товары
- **orders** - заказы (total, status, customer_name, phone)
- **order_items** - состав заказов (связь orders ↔ products)
- **reviews** - отзывы с рейтингом (1-5 звезд)

### Просмотр production БД
```bash
node db-render.js
```

## API Endpoints

### Товары
- `GET /api/products` - список товаров
- `GET /api/products/:id` - товар по ID
- `GET /api/categories` - категории

### Корзина
- `GET /api/cart/:userId` - корзина пользователя
- `POST /api/cart` - добавить товар
- `PUT /api/cart` - изменить количество
- `DELETE /api/cart/:userId/:productId` - удалить товар

### Избранное
- `GET /api/favorites/:userId` - избранное пользователя
- `POST /api/favorites` - добавить в избранное
- `DELETE /api/favorites/:userId/:productId` - удалить

### Заказы
- `POST /api/orders` - создать заказ
- `GET /api/orders/:userId` - заказы пользователя

### Отзывы
- `GET /api/reviews/:productId` - отзывы товара
- `POST /api/reviews` - добавить отзыв

### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход

## Production

**URL**: https://kitchen-shop-l4jl.onrender.com  
**Database**: PostgreSQL 18 на Render (Frankfurt)  
**Auto-deploy**: Каждый push в main ветку

### Free Tier
Сервис засыпает после 15 минут бездействия. Первый запрос после "сна" занимает ~30-60 секунд (холодный старт).

## Зависимости

```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5"
}
```

## Лицензия

MIT

## Автор

Cherkasov Alexey

## Ссылки

- **Production**: https://kitchen-shop-l4jl.onrender.com
- **Repository**: https://github.com/Cherkasov-Alexey/kitchen-shop
