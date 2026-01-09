// Проверка структуры таблицы users
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://kitchen_shop_5b8v_user:3IsrZMhus77VjNzygouuwiJ1cg1R0sUX@dpg-d5gilmnfte5s73flt7g0-a.frankfurt-postgres.render.com/kitchen_shop_5b8v';

async function checkUsersTable() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Подключено\n');

        // Получаем все колонки таблицы users
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Структура таблицы users:');
        console.table(columns.rows);

        // Получаем все данные из users
        const users = await client.query('SELECT * FROM users');
        console.log('\n👤 Все данные пользователей:');
        console.table(users.rows);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await client.end();
    }
}

checkUsersTable();
