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
        console.log('Подключено к базе данных Render\n');

        // Категории
        const categories = await client.query('SELECT * FROM categories ORDER BY id');
        console.log('КАТЕГОРИИ:');
        console.table(categories.rows);

        // Товары - полная информация
        const products = await client.query('SELECT * FROM products ORDER BY id');
        console.log('\n ТОВАРЫ:');
        
        const truncate = (str, maxLen = 15) => {
            if (!str) return 'отсутствует';
            return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
        };
        
        console.table(products.rows.map(p => ({
            id: p.id,
            product_name: p.product_name,
            price: p.price,
            old_price: p.old_price,
            category_id: p.category_id,
            description: truncate(p.description, 15),
            specifications: truncate(p.specifications, 15),
            warranty: truncate(p.warranty, 15),
            images: truncate(p.images, 15),
            created_at: toMoscowTime(p.created_at)
        })));

        // Пользователи
        const users = await client.query('SELECT id, user_name, email, password_hash, created_at FROM users ORDER BY id');
        console.log('\n ПОЛЬЗОВАТЕЛИ:');
        const usersWithMoscowTime = users.rows.map(u => ({
            id: u.id,
            user_name: u.user_name,
            email: u.email,
            password_hash: u.password_hash ? u.password_hash.substring(0, 20) + '...' : null,
            created_at: toMoscowTime(u.created_at)
        }));
        console.table(usersWithMoscowTime);

        // Заказы
        const orders = await client.query('SELECT * FROM orders ORDER BY created_at DESC');
        console.log('\n ЗАКАЗЫ:');
        const ordersWithMoscowTime = orders.rows.map(o => ({
            id: o.id,
            user_id: o.user_id,
            total: o.total,
            status: o.status,
            customer_name: o.customer_name,
            customer_phone: o.customer_phone,
            customer_email: o.customer_email,
            delivery_address: o.delivery_address ? o.delivery_address.substring(0, 20) + '...' : null,
            payment_method: o.payment_method,
            comment: o.comment ? o.comment.substring(0, 20) + '...' : null,
            created_at: toMoscowTime(o.created_at),
            updated_at: toMoscowTime(o.updated_at)
        }));
        console.table(ordersWithMoscowTime);

        // Корзина
        const cart = await client.query(`
            SELECT id, user_id, product_id, quantity, total, added_at
            FROM cart
            ORDER BY user_id
        `);
        console.log('\n КОРЗИНА:');
        if (cart.rows.length > 0) {
            const cartWithMoscowTime = cart.rows.map(c => ({
                user_id: c.user_id,
                product_id: c.product_id,
                quantity: c.quantity,
                total: c.total,
                added_at: toMoscowTime(c.added_at)
            }));
            console.table(cartWithMoscowTime);
        } else {
            console.log('Пусто');
        }

        // Товары в заказах (order_items)
        const orderItems = await client.query(`
            SELECT id, order_id, product_id, quantity, price
            FROM order_items
            ORDER BY order_id
        `);
        console.log('\n ТОВАРЫ В ЗАКАЗАХ (ORDER_ITEMS):');
        if (orderItems.rows.length > 0) {
            console.table(orderItems.rows);
        } else {
            console.log('Пусто');
        }

        // Избранное
        const favorites = await client.query(`
            SELECT id, user_id, product_id, added_at
            FROM favorites
            ORDER BY user_id
        `);
        console.log('\n ИЗБРАННОЕ:');
        if (favorites.rows.length > 0) {
            const favoritesWithMoscowTime = favorites.rows.map(f => ({
                user_id: f.user_id,
                product_id: f.product_id,
                added_at: toMoscowTime(f.added_at)
            }));
            console.table(favoritesWithMoscowTime);
        } else {
            console.log('Пусто');
        }

        // Отзывы
        const reviews = await client.query(`
            SELECT id, user_id, product_id, rating, text, created_at
            FROM reviews
            ORDER BY created_at DESC
        `);
        console.log('\n ОТЗЫВЫ:');
        if (reviews.rows.length > 0) {
            const reviewsWithMoscowTime = reviews.rows.map(r => ({
                id: r.id,
                user_id: r.user_id,
                product_id: r.product_id,
                rating: r.rating,
                text: r.text ? r.text.substring(0, 30) + '...' : null,
                created_at: toMoscowTime(r.created_at)
            }));
            console.table(reviewsWithMoscowTime);
        } else {
            console.log('Пусто');
        }

    } catch (error) {
        console.error(' Ошибка:', error.message);
    } finally {
        await client.end();
        console.log('\n Соединение закрыто');
    }
}

viewRenderDatabase();
