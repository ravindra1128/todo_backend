import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todos'; // Importing the todo routes
import authRoutes from './routes/auth'; // Importing the auth routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // To parse JSON requests

app.use('/todos', todoRoutes); // All routes under /todos
app.use('/auth', authRoutes); // Assuming you have auth routes set up

app.get('/', (_req, res) => {
  res.send('Todo API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
