const express = require('express');
const dbAdapter = require('./db-adapter');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Функция для конвертации UTC в московское время
function formatMoscowDateTime(utcDate) {
    const date = new Date(utcDate);
    // Добавляем 3 часа для UTC+3
    date.setHours(date.getHours() + 3);
    return date.toISOString();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// Подключение к PostgreSQL (используем DATABASE_URL если доступен, иначе отдельные переменные)
let dbConfig;
if (process.env.DATABASE_URL) {
    dbConfig = { connectionString: process.env.DATABASE_URL };
    console.log('Using DATABASE_URL for Postgres connection');
} else {
    dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'Alexey_25052006',
        database: process.env.DB_NAME || 'kitchen_shop',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432
    };
}

let db;

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Простая проверка состояния сервиса
app.get('/health', async (req, res) => {
    try {
        if (db) {
            // Проверяем подключение к БД
            await db.query('SELECT 1');
            res.json({ 
                status: 'healthy', 
                database: 'connected',
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({ 
                status: 'unhealthy', 
                database: 'not initialized',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Подключение к базе данных
async function connectDB() {
    try {
        // Подключаемся через PostgreSQL адаптер
        db = await dbAdapter.connect(dbConfig);
        console.log('Подключение к PostgreSQL установлено');

        // Получаем количество товаров
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM products');
        console.log('В базе данных ${rows[0].count} товаров');
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error);
        console.error('Продолжаю запуск сервера без подключения к БД (режим деградации).');
        db = null;
    }
}

// API: Получить все категории
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await db.execute('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: Получить все товары или с фильтрами
app.get('/api/products', async (req, res) => {
    try {
        const { category_id, sale, featured, limit } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];

        if (category_id) {
            query += ' AND category_id = ?';
            params.push(category_id);
        }

        if (sale === 'true') {
            query += ' AND old_price IS NOT NULL';
        }

        if (featured === 'true') {
            query += ' AND old_price IS NOT NULL';
        }

        const [products] = await db.execute(query, params);
        
        // Применяем LIMIT после получения результатов
        let result = products;
        if (limit) {
            result = products.slice(0, parseInt(limit));
        }
        
        // Преобразуем строку images в массив
        const productsWithImages = result.map(product => ({
            ...product,
            images: product.images ? product.images.split(',') : [],
            image_url: product.images ? product.images.split(',')[0] : null
        }));

        res.json(productsWithImages);
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: Получить товар по ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [productId]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        const product = products[0];
        
        // Преобразуем строку images в массив
        product.images = product.images ? product.images.split(',') : [];
        product.image_url = product.images[0] || null;

        res.json(product);
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ ПОЛЬЗОВАТЕЛЕЙ =====

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
        }
        
        // Проверяем, существует ли пользователь
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        // Хешируем пароль
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Создаем пользователя с хешированным паролем
        const [rows] = await db.execute(
            'INSERT INTO users (user_name, email, password_hash) VALUES (?, ?, ?) RETURNING id, user_name, email, created_at',
            [name, email, passwordHash]
        );
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        // Получаем пользователя с хешем пароля
        const [users] = await db.execute(
            'SELECT id, user_name, email, password_hash, created_at FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        // Проверяем пароль
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        // Возвращаем данные без password_hash
        res.json({ 
            id: user.id, 
            user_name: user.user_name, 
            email: user.email,
            created_at: user.created_at 
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ КОРЗИНЫ =====

// Получить корзину пользователя
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const [items] = await db.execute(`
            SELECT c.id, c.user_id, c.product_id, c.quantity, c.added_at,
                   p.product_name, p.price, p.images
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);
        
        // Форматируем данные для фронтенда
        const cartItems = items.map(item => ({
            id: item.product_id,
            product_name: item.product_name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.images ? item.images.split(',')[0] : ''
        }));
        
        res.json(cartItems);
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить товар в корзину
app.post('/api/cart', async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;
        
        if (!user_id || !product_id) {
            return res.status(400).json({ error: 'user_id и product_id обязательны' });
        }
        
        // Получаем цену товара
        const [product] = await db.execute(
            'SELECT price FROM products WHERE id = ?',
            [product_id]
        );
        
        if (product.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        const price = parseFloat(product[0].price);
        const qty = quantity || 1;
        const total = price * qty;
        
        // Проверяем, есть ли уже товар в корзине
        const [existing] = await db.execute(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        
        if (existing.length > 0) {
            // Обновляем количество и total
            const newQty = existing[0].quantity + qty;
            const newTotal = price * newQty;
            await db.execute(
                'UPDATE cart SET quantity = ?, total = ? WHERE user_id = ? AND product_id = ?',
                [newQty, newTotal, user_id, product_id]
            );
        } else {
            // Добавляем новую запись
            await db.execute(
                'INSERT INTO cart (user_id, product_id, quantity, total) VALUES (?, ?, ?, ?)',
                [user_id, product_id, qty, total]
            );
        }
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить количество товара в корзине
app.put('/api/cart', async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;
        
        if (quantity <= 0) {
            await db.execute(
                'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
                [user_id, product_id]
            );
        } else {
            // Получаем цену товара
            const [product] = await db.execute(
                'SELECT price FROM products WHERE id = ?',
                [product_id]
            );
            
            if (product.length > 0) {
                const price = parseFloat(product[0].price);
                const total = price * quantity;
                
                await db.execute(
                    'UPDATE cart SET quantity = ?, total = ? WHERE user_id = ? AND product_id = ?',
                    [quantity, total, user_id, product_id]
                );
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить товар из корзины
app.delete('/api/cart/:userId/:productId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);
        
        await db.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Очистить корзину пользователя
app.delete('/api/cart/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        await db.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ ИЗБРАННОГО =====

// Получить избранное пользователя
app.get('/api/favorites/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const [items] = await db.execute(`
            SELECT p.id, p.product_name, p.price, p.old_price, p.images
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            WHERE f.user_id = ?
            ORDER BY f.added_at DESC
        `, [userId]);

        // Форматируем результат
        const formatted = items.map(item => ({
            id: item.id,
            product_name: item.product_name,
            price: item.price,
            old_price: item.old_price,
            image_url: item.images ? item.images.split(',')[0] : null
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Ошибка получения избранного:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить в избранное
app.post('/api/favorites', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;
        
        if (!user_id || !product_id) {
            return res.status(400).json({ error: 'user_id и product_id обязательны' });
        }
        
        // Проверяем, есть ли уже товар в избранном
        const [existing] = await db.execute(
            'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        
        if (existing.length === 0) {
            await db.execute(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [user_id, product_id]
            );
        }
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить из избранного
app.delete('/api/favorites/:userId/:productId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);
        
        await db.execute(
            'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка удаления из избранного:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Проверить, есть ли товар в избранном
app.get('/api/favorites/:userId/:productId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const productId = parseInt(req.params.productId);
        
        const [items] = await db.execute(
            'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        res.json({ isFavorite: items.length > 0 });
    } catch (error) {
        console.error('Ошибка проверки избранного:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ ЗАКАЗОВ =====

// Создать заказ
app.post('/api/orders', async (req, res) => {
    try {
        const {
            user_id,
            total,
            delivery_address,
            payment_method,
            comment,
            customer_name,
            customer_phone,
            customer_email
        } = req.body;

        if (!user_id || !total || !delivery_address || !payment_method) {
            return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
        }

        // Получаем товары из корзины пользователя
        const [cartItems] = await db.execute(`
            SELECT c.product_id, c.quantity, p.price, p.product_name
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [user_id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        // Создаем заказ
        const [orderResult] = await db.execute(`
            INSERT INTO orders (user_id, total, status, delivery_address, payment_method, comment, customer_name, customer_phone, customer_email)
            VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)
            RETURNING *
        `, [user_id, total, delivery_address, payment_method, comment || null, customer_name, customer_phone, customer_email || null]);

        const orderId = orderResult[0].id;
        console.log('Создан заказ с ID:', orderId);

        // Добавляем товары в order_items
        for (const item of cartItems) {
            await db.execute(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, item.price]);
        }

        res.status(201).json({
            id: orderId,
            success: true,
            message: 'Заказ успешно создан'
        });
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить заказы пользователя
app.get('/api/orders/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const [orders] = await db.execute(`
            SELECT * FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        // Для каждого заказа получаем его товары
        for (let order of orders) {
            const [items] = await db.execute(`
                SELECT oi.*, p.product_name, p.images
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            order.items = items.map(item => ({
                ...item,
                image_url: item.images ? item.images.split(',')[0] : null
            }));
        }

        res.json(orders);
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить один заказ
app.get('/api/orders/detail/:orderId', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        
        const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        const order = orders[0];

        // Получаем товары заказа
        const [items] = await db.execute(`
            SELECT oi.*, p.product_name, p.images
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        
        order.items = items.map(item => ({
            ...item,
            image_url: item.images ? item.images.split(',')[0] : null
        }));

        res.json(order);
    } catch (error) {
        console.error('Ошибка получения заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: Получить отзывы для товара
app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const [reviews] = await db.execute(`
            SELECT r.*, u.user_name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [productId]);
        
        res.json(reviews);
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API: Добавить отзыв
app.post('/api/reviews', async (req, res) => {
    try {
        const { user_id, product_id, rating, text } = req.body;
        
        // Валидация
        if (!user_id || !product_id || !rating || !text) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
        }
        
        // Вставка отзыва с возвратом ID
        const [result] = await db.execute(
            'INSERT INTO reviews (user_id, product_id, rating, text) VALUES (?, ?, ?, ?) RETURNING id',
            [user_id, product_id, rating, text]
        );
        
        // Получаем созданный отзыв с именем пользователя
        const [reviews] = await db.execute(`
            SELECT r.*, u.user_name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [result[0].id]);
        
        res.status(201).json(reviews[0]);
    } catch (error) {
        console.error('Ошибка добавления отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
connectDB().then(() => {
    app.listen(PORT, () => {
        const deployedUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        console.log('Сервер запущен на ${deployedUrl}');
        console.log('Доступные страницы:');
        console.log('${deployedUrl} - Главная');
        console.log('${deployedUrl}/catalog.html - Каталог');
        console.log('${deployedUrl}/product.html - Страница товара');
    });
});
