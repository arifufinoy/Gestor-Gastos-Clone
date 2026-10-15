import {SQLiteDatabase} from 'expo-sqlite';

export const DATABASE_NAME = 'gastos.db';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS expenses (
            id          TEXT PRIMARY KEY,
            amount      REAL NOT NULL,
            category    TEXT NOT NULL,
            date        TEXT NOT NULL,
            description TEXT,
            factura_adjuntar TEXT
        );
    `);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(expenses)');
    if (!columns.some((column) => column.name === 'factura_adjuntar')) {
        await db.execAsync('ALTER TABLE expenses ADD COLUMN factura_adjuntar TEXT');
    }
}