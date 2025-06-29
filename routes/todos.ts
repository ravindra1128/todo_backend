// routes/todos.ts
import { Router } from 'express';
import { createTodo, deleteTodo, getTodos, toggaleTodo } from '../controllers/todoController';
import { authenticate } from '../middleware/auth';

const router = Router();


router.get('/', authenticate, getTodos);
router.post('/', authenticate, createTodo);
router.patch('/:id', toggaleTodo); // Assuming toggling a todo is handled by the same controller function
router.delete('/:id', deleteTodo)

export default router;
