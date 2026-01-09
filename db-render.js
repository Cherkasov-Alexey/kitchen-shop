// Скрипт для просмотра данных на Render
const { Client } = require('pg');

// DATABASE_URL с Render
const DATABASE_URL = 'postgresql://kitchen_shop_5b8v_user:3IsrZMhus77VjNzygouuwiJ1cg1R0sUX@dpg-d5gilmnfte5s73flt7g0-a.frankfurt-postgres.render.com/kitchen_shop_5b8v';

// Функция для конвертации UTC в Moscow Time
function toMoscowTime(utcDate) {
    if (!utcDate) return null;
    const date = new Date(utcDate);
    // Добавляем 3 часа
    date.setHours(date.getHours() + 3);
    return date.toISOString().replace('Z', ' MSK');
}

async function viewRenderDatabase() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Подключено к базе данных Render\n');

        // Категории
        const categories = await client.query('SELECT * FROM categories ORDER BY id');
        console.log('📂 КАТЕГОРИИ:');
        console.table(categories.rows);

        // Товары
        const products = await client.query('SELECT id, product_name, price, old_price, category_id FROM products ORDER BY id');
        console.log('\n📦 ТОВАРЫ:');
        console.table(products.rows);

        // Пользователи
        const users = await client.query('SELECT id, user_name, email, password_hash, created_at FROM users ORDER BY id');
        console.log('\n👤 ПОЛЬЗОВАТЕЛИ:');
        const usersWithMoscowTime = users.rows.map(u => ({
            id: u.id,
            user_name: u.user_name,
            email: u.email,
            password_hash: u.password_hash ? u.password_hash.substring(0, 20) + '...' : null,
            created_at: toMoscowTime(u.created_at)
        }));
        console.table(usersWithMoscowTime);

        // Заказы
        const orders = await client.query('SELECT id, user_id, total, status, customer_name, customer_phone, created_at FROM orders ORDER BY created_at DESC');
        console.log('\n🛒 ЗАКАЗЫ:');
        const ordersWithMoscowTime = orders.rows.map(o => ({
            ...o,
            created_at: toMoscowTime(o.created_at)
        }));
        console.table(ordersWithMoscowTime);

        // Корзина
        const cart = await client.query(`
            SELECT c.user_id, u.email, p.product_name, c.quantity, p.price, (c.quantity * p.price) as total
            FROM cart c
            JOIN users u ON c.user_id = u.id
            JOIN products p ON c.product_id = p.id
            ORDER BY c.user_id
        `);
        console.log('\n🛒 КОРЗИНА:');
        if (cart.rows.length > 0) {
            console.table(cart.rows);
        } else {
            console.log('Пусто');
        }

        // Избранное
        const favorites = await client.query(`
            SELECT f.user_id, u.email, p.product_name
            FROM favorites f
            JOIN users u ON f.user_id = u.id
            JOIN products p ON f.product_id = p.id
            ORDER BY f.user_id
        `);
        console.log('\n❤️ ИЗБРАННОЕ:');
        if (favorites.rows.length > 0) {
            console.table(favorites.rows);
        } else {
            console.log('Пусто');
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
        console.log('\n✅ Соединение закрыто');
    }
}

viewRenderDatabase();
