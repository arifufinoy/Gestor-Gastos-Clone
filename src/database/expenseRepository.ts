import {SQLiteDatabase} from 'expo-sqlite';
import {Category, Expense} from '../types/expense';

interface ExpenseRow {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;
    factura_adjuntar: string | null;
}

function rowToExpense(row: ExpenseRow): Expense {
    return {
        id: row.id,
        amount: row.amount,
        category: row.category as Category,
        date: new Date(row.date),
        description: row.description ?? undefined,
        factura_adjuntar: row.factura_adjuntar ?? undefined,
    };
}

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
    const rows = await db.getAllAsync<ExpenseRow>(
        'SELECT id, amount, category, date, description, factura_adjuntar FROM expenses ORDER BY date DESC'
    );
    return rows.map(rowToExpense);
}

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description, factura_adjuntar) VALUES (?, ?, ?, ?, ?, ?)',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(), //Aqui realizamos los cambios de date a texto ISO
        expense.description ?? null,
        expense.factura_adjuntar ?? null,
    );
}

export async function updateExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
        await db.runAsync(
            'UPDATE expenses SET amount = ?, category = ?, date = ?, description = ?, factura_adjuntar = ? WHERE id = ?',
            expense.amount,
            expense.category,
            expense.date.toISOString(),
            expense.description ?? null,
            expense.factura_adjuntar ?? null,
            expense.id,
        );
}

export async function deleteExpense(db: SQLiteDatabase, id: string): Promise<void> {
        await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}