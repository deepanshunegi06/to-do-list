const express = require('express');
const { body, validationResult } = require('express-validator');
const dataStore = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, priority, completed, search } = req.query;
  
  let todos = dataStore.getTodos();

  if (category) {
    todos = todos.filter(t => t.category === category);
  }

  if (priority) {
    todos = todos.filter(t => t.priority === priority);
  }

  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    todos = todos.filter(t => t.completed === isCompleted);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    todos = todos.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    );
  }

  res.json({ todos, total: todos.length });
});

router.post('/', [
  body('title').notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('category').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, priority, category, dueDate, tags } = req.body;
  const todo = dataStore.createTodo({ title, description, priority, category, dueDate, tags });

  res.status(201).json({ message: 'Todo created successfully', todo });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority, category, dueDate, tags } = req.body;

  const existingTodo = dataStore.getTodoById(id);
  if (!existingTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo = dataStore.updateTodo(id, {
    title,
    description,
    completed,
    priority,
    category,
    dueDate,
    tags
  });

  res.json({ message: 'Todo updated successfully', todo: updatedTodo });
});

router.patch('/:id/toggle', (req, res) => {
  const { id } = req.params;
  
  const existingTodo = dataStore.getTodoById(id);
  if (!existingTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo = dataStore.updateTodo(id, { completed: !existingTodo.completed });
  res.json({ message: 'Todo toggled successfully', todo: updatedTodo });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const deleted = dataStore.deleteTodo(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json({ message: 'Todo deleted successfully' });
});

module.exports = router;