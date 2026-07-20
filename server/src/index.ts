import express from "express";
import cors from "cors";

import userRouter from "./routes/user.js";
import tasksRouter from "./routes/tasks.js";
import coursesRouter from "./routes/courses.js";
import wrongQuestionsRouter from "./routes/wrongQuestions.js";
import searchRouter from "./routes/search.js";
import favoritesRouter from "./routes/favorites.js";
import exportRouter from "./routes/export.js";
import aiRouter from "./routes/ai.js";
import practiceRouter from "./routes/practice.js";
import questionsRouter from "./routes/questions.js";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/wrong-questions', wrongQuestionsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/export', exportRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/practice', practiceRouter);
app.use('/api/v1/questions', questionsRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
