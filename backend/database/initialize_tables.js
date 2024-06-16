// initialize_tables.js
const pgp = require('pg-promise')();
const argparse = require('argparse');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const createTables = async (db) => {
    await db.none(`
        CREATE TABLE IF NOT EXISTS "user" (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE,
            username VARCHAR(255) UNIQUE,
            password_hash VARCHAR(255),
            google_id VARCHAR(255) UNIQUE,
            google_token VARCHAR(2048),
            subscription_status VARCHAR(50) DEFAULT 'inactive',
            subscription_id VARCHAR(255),
            preference_text TEXT,
            preference_embedding vector(${process.env.EMBEDDINGS_SIZE}) DEFAULT NULL,
            preference_categories VARCHAR(255)[] DEFAULT '{}'
        );
    `);

    await db.none(`
        CREATE TABLE IF NOT EXISTS "arxiv_metadata" (
            id SERIAL PRIMARY KEY,
            arxiv_id VARCHAR(255) UNIQUE,
            url TEXT,
            title TEXT,
            authors TEXT[],
            abstract TEXT,
            date TIMESTAMP,
            categories TEXT[],

            summary TEXT,
            full_text TEXT,
            thumbnail TEXT,
            abstract_embedding vector(${process.env.EMBEDDINGS_SIZE}) DEFAULT NULL,
            hidden BOOLEAN DEFAULT FALSE,
            bookmarked BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const addAdmin = async (db) => {
    await db.none(`
        INSERT INTO "user" (email, username, password_hash, subscription_status, subscription_id)
        VALUES ('admin@admin.com', 'admin', 'admin', 'active', 'test')
    `);
};

const tablesExist = async (db, tableName) => {
    const tables = await db.any("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    return tables.some(table => table.table_name === tableName);
};

const main = async (args) => {
    const db = pgp({
        host: args.host,
        port: args.port,
        user: args.user,
        password: args.password
    });

    await db.none("CREATE EXTENSION IF NOT EXISTS vector;");

    for (const table of ['user', 'arxiv_metadata']) {
        if (await tablesExist(db, table)) {
            const response = await new Promise(resolve => {
                readline.question(`Table '${table}' already exists. Do you want to recreate it? (y/n): `, ans => {
                    readline.close();
                    resolve(ans);
                });
            });

            if (response.toLowerCase() !== 'y') {
                console.log(`Table '${table}' not recreated.`);
            } else {
                await db.none(`DROP TABLE IF EXISTS ${table};`);
            }
        }
    }

    await createTables(db);
    await addAdmin(db);
    console.log("Tables created successfully!");
    pgp.end();
    readline.close();
    process.exit(0);
};

const parser = new argparse.ArgumentParser({
    description: "Initialize tables."
});

parser.add_argument('--host', { default: 'localhost', help: 'PostgreSQL host.' });
parser.add_argument('--port', { default: 5432, type: 'int', help: 'PostgreSQL port.' });
parser.add_argument('--user', { default: 'postgres', help: 'PostgreSQL user.' });
parser.add_argument('--password', { default: 'password', help: 'PostgreSQL password.' });

const args = parser.parse_args();
main(args);
