// Скрипт для удаления пользователя Alexey
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://kitchen_shop_5b8v_user:3IsrZMhus77VjNzygouuwiJ1cg1R0sUX@dpg-d5gilmnfte5s73flt7g0-a.frankfurt-postgres.render.com/kitchen_shop_5b8v';

async function deleteUser() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Подключено к базе данных\n');

        // Удаляем данные пользователя Alexey (id=2, email=lesha@gmail.com)
        
        // 1. Удаляем заказы
        const ordersResult = await client.query('DELETE FROM orders WHERE user_id = 2');
        console.log(`🗑️  Удалено заказов: ${ordersResult.rowCount}`);

        // 2. Удаляем из корзины
        const cartResult = await client.query('DELETE FROM cart WHERE user_id = 2');
        console.log(`🗑️  Удалено товаров из корзины: ${cartResult.rowCount}`);

        // 3. Удаляем из избранного
        const favResult = await client.query('DELETE FROM favorites WHERE user_id = 2');
        console.log(`🗑️  Удалено из избранного: ${favResult.rowCount}`);

        // 4. Удаляем отзывы
        const reviewsResult = await client.query('DELETE FROM reviews WHERE user_id = 2');
        console.log(`🗑️  Удалено отзывов: ${reviewsResult.rowCount}`);

        // 5. Удаляем пользователя
        const userResult = await client.query('DELETE FROM users WHERE id = 2');
        console.log(`🗑️  Удалено пользователей: ${userResult.rowCount}`);

        console.log('\n✅ Пользователь Alexey (lesha@gmail.com) полностью удален!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
    }
}

deleteUser();
