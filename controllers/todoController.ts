// controllers/todoController.ts
import { Request, Response } from 'express';
import { pool } from '../db';

export const getTodos = async (_req: Request, res: Response) => {
    const { page = 1, limit = 10 } = _req.query;
    const userId = (_req as any).user.id;

    try {

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        console.log(userId)
        const result = await pool.query(`SELECT * FROM todos WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3`, [userId ,limit, offset]);
        const total = await pool.query('SELECT COUNT(*) FROM todos');
        res.status(200).json({
            todos: result.rows,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: parseInt(total.rows[0].count),
        });
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


export const createTodo = async (req: Request, res: Response) => {
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
        res.status(400).json({ message: 'Invalid title' });
    }
    const userId = (req as any).user.id;

    try {
        const result = await pool.query(
            'INSERT INTO todos (title, completed, userID) VALUES ($1, $2, $3) RETURNING *',
            [title, false, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const toggaleTodo = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        if (!id) {
            res.status(400).json({ message: 'Invalid ID' });
        }

        const existing = await pool.query('SELECT completed FROM todos WHERE id = $1', [id]);

        if (existing.rowCount === 0) {
            res.status(404).json({ message: 'Todo not found' });
        }

        const completed = !existing.rows[0].completed;
        const updateResult = await pool.query(
            'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
            [completed, id]);

        res.status(200).json(updateResult.rows[0]);
    } catch (err) {
        console.error('Error toggling todo:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

export const deleteTodo = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'Invalid ID' });
    }
    try {
        const existing = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        if (existing.rowCount === 0) {
            res.status(404).json({ message: 'Todo not found' });
        }

        const deleteTodo = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ message: 'Server error' });
    }
} 