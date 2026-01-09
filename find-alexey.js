// Поиск всех записей с Alexey
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://kitchen_shop_5b8v_user:3IsrZMhus77VjNzygouuwiJ1cg1R0sUX@dpg-d5gilmnfte5s73flt7g0-a.frankfurt-postgres.render.com/kitchen_shop_5b8v';

async function findAlexey() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Подключено к базе\n');

        // Ищем в users
        const users = await client.query("SELECT * FROM users WHERE email LIKE '%lesha%' OR email LIKE '%alexey%'");
        console.log('👤 Пользователи:', users.rows);

        // Ищем в orders по имени
        const orders = await client.query("SELECT * FROM orders WHERE customer_name LIKE '%Alexey%' OR customer_phone = '1234567890'");
        console.log('\n📦 Заказы:', orders.rows);

        // Ищем order_items для этих заказов
        if (orders.rows.length > 0) {
            const orderIds = orders.rows.map(o => o.id);
            const orderItems = await client.query(`SELECT * FROM order_items WHERE order_id = ANY($1)`, [orderIds]);
            console.log('\n📝 Товары в заказах:', orderItems.rows);
        }

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
    }
}

findAlexey();
