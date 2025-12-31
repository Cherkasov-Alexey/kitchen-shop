const { Client } = require('pg');

let client = null;

function convertPlaceholders(sql) {
    // convert ? placeholders to $1, $2, ... for pg
    let parts = sql.split('?');
    if (parts.length === 1) return sql;
    let res = parts[0];
    for (let i = 1; i < parts.length; i++) {
        res += `$${i}${parts[i]}`;
    }
    return res;
}

module.exports = {
    async connect(config) {
        // support either a full connection string or individual params
        let clientOptions;
        if (config && config.connectionString) {
            clientOptions = { connectionString: config.connectionString };
        } else {
            clientOptions = {
                host: config.host || 'localhost',
                port: config.port ? Number(config.port) : 5432,
                user: config.user || 'shop',
                password: config.password || 'shop_pass',
                database: config.database || process.env.DB_NAME || 'kitchen_shop'
            };
        }

        // Log connection info (hide password)
        console.log('🔌 Подключаюсь к Postgres:', {
            host: clientOptions.host || (clientOptions.connectionString ? '<connectionString>' : 'localhost'),
            port: clientOptions.port || 5432,
            user: clientOptions.user || (clientOptions.connectionString ? '<from connectionString>' : 'shop'),
            database: clientOptions.database || (clientOptions.connectionString ? '<from connectionString>' : 'kitchen_shop'),
            password: clientOptions.password ? '***' : (clientOptions.connectionString ? '*** (from connectionString)' : 'ОТСУТСТВУЕТ!')
        });

        client = new Client(clientOptions);
        await client.connect();
        await client.query("SET client_encoding = 'UTF8'");

        return {
            // keep mysql2-like execute(sql, params) signature returning [rows]
            execute: async (sql, params = []) => {
                const pgSql = convertPlaceholders(sql);
                const res = await client.query(pgSql, params);
                return [res.rows, res.fields];
            },
            query: async (sql, params = []) => {
                const pgSql = convertPlaceholders(sql);
                return client.query(pgSql, params);
            },
            end: async () => {
                await client.end();
            }
        };
    }
};
