// Удаление всех записей Alexey из локальной базы
const { Client } = require('pg');

async function cleanLocal() {
    const client = new Client({
        host: 'localhost',
        user: 'postgres',
        password: 'Alexey_25052006',
        database: 'kitchen_shop',
        port: 5432
    });

    try {
        await client.connect();
        console.log('✅ Подключено к локальной БД\n');

        // Удаляем пользователя с email содержащим lesha или alexey
        const users = await client.query("SELECT id, email FROM users WHERE email LIKE '%lesha%' OR email LIKE '%alexey%'");
        console.log('Найдено пользователей:', users.rows);

        for (const user of users.rows) {
            console.log(`\nУдаляем пользователя: ${user.email} (ID: ${user.id})`);
            
            await client.query('DELETE FROM orders WHERE user_id = $1', [user.id]);
            await client.query('DELETE FROM cart WHERE user_id = $1', [user.id]);
            await client.query('DELETE FROM favorites WHERE user_id = $1', [user.id]);
            await client.query('DELETE FROM reviews WHERE user_id = $1', [user.id]);
            await client.query('DELETE FROM users WHERE id = $1', [user.id]);
        }

        // Удаляем заказы с именем Alexey
        const orders = await client.query("DELETE FROM orders WHERE customer_name LIKE '%Alexey%' RETURNING id");
        console.log(`\nУдалено заказов: ${orders.rowCount}`);

        console.log('\n✅ Очистка завершена!');

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
    }
}

cleanLocal();
