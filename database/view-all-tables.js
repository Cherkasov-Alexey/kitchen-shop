const { Client } = require('pg');

async function viewAllTables() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'Alexey_25052006',
        database: 'kitchen_shop'
    });

    try {
        await client.connect();
        await client.query("SET client_encoding = 'UTF8'");

        // Пользователи
        console.log('========== ПОЛЬЗОВАТЕЛИ (users) ==========');
        const users = await client.query('SELECT id, user_name, email, password_hash, created_at FROM users');
        console.table(users.rows);

        // Категории
        console.log('\n========== КАТЕГОРИИ (categories) ==========');
        const categories = await client.query('SELECT * FROM categories');
        console.table(categories.rows);

        // Товары
        console.log('\n========== ТОВАРЫ (products) ==========');
        const products = await client.query('SELECT id, product_name, price, category_id FROM products');
        console.table(products.rows);

        // Корзины
        console.log('\n========== КОРЗИНЫ (cart) ==========');
        const cart = await client.query(`
            SELECT c.id, c.user_id, u.user_name as user_name, c.product_id, p.product_name as product_name, c.quantity, p.price
            FROM cart c
            JOIN users u ON c.user_id = u.id
            JOIN products p ON c.product_id = p.id
        `);
        if (cart.rows.length > 0) {
            console.table(cart.rows);
        } else {
            console.log('Корзины пусты');
        }

        // Избранное
        console.log('\n========== ИЗБРАННОЕ (favorites) ==========');
        const favorites = await client.query(`
            SELECT f.id, f.user_id, u.user_name as user_name, f.product_id, p.product_name as product_name, f.added_at
            FROM favorites f
            JOIN users u ON f.user_id = u.id
            JOIN products p ON f.product_id = p.id
        `);
        if (favorites.rows.length > 0) {
            console.table(favorites.rows);
        } else {
            console.log('Избранное пусто');
        }

        // Заказы
        console.log('\n========== ЗАКАЗЫ (orders) ==========');
        const orders = await client.query(`
            SELECT o.id, o.user_id, u.user_name as user_name, o.total, o.status, 
                   o.customer_name, o.customer_phone, o.customer_email,
                   o.delivery_address, o.payment_method,
                   o.created_at
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        if (orders.rows.length > 0) {
            console.table(orders.rows);
        } else {
            console.log('Заказов нет');
        }

        // Товары в заказах
        console.log('\n========== ТОВАРЫ В ЗАКАЗАХ (order_items) ==========');
        const orderItems = await client.query(`
            SELECT oi.id, oi.order_id, oi.product_id, p.product_name as product_name, 
                   oi.quantity, oi.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            ORDER BY oi.order_id DESC
        `);
        if (orderItems.rows.length > 0) {
            console.table(orderItems.rows);
        } else {
            console.log('Товаров в заказах нет');
        }

        // Отзывы
        console.log('\n========== ОТЗЫВЫ (reviews) ==========');
        const reviews = await client.query(`
            SELECT r.id, r.user_id, u.user_name as user_name, r.product_id, 
                   p.product_name as product_name, r.rating, r.text, r.created_at
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `);
        if (reviews.rows.length > 0) {
            console.table(reviews.rows);
        } else {
            console.log('Отзывов нет');
        }

        console.log('\n✅ Готово!');
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
    }
}

viewAllTables();
