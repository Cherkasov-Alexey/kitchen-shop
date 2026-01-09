// Скрипт для просмотра данных на Render
const { Client } = require('pg');

// DATABASE_URL с Render
const DATABASE_URL = 'postgresql://kitchen_shop_5b8v_user:3IsrZMhus77VjNzygouuwiJ1cg1R0sUX@dpg-d5gilmnfte5s73flt7g0-a.frankfurt-postgres.render.com/kitchen_shop_5b8v';

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
        const users = await client.query('SELECT id, email, created_at FROM users ORDER BY id');
        console.log('\n👤 ПОЛЬЗОВАТЕЛИ:');
        console.table(users.rows);

        // Заказы
        const orders = await client.query('SELECT id, user_id, total, status, customer_name, customer_phone, created_at FROM orders ORDER BY created_at DESC');
        console.log('\n🛒 ЗАКАЗЫ:');
        console.table(orders.rows);

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
