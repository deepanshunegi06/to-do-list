const { v4: uuidv4 } = require('uuid');

class DataStore {
  constructor() {
    this.users = [];
    this.todos = [];
    this.categories = [
      { id: 'work', name: 'Work', color: '#FF6B6B' },
      { id: 'personal', name: 'Personal', color: '#4ECDC4' },
      { id: 'shopping', name: 'Shopping', color: '#45B7D1' },
      { id: 'health', name: 'Health', color: '#96CEB4' },
      { id: 'study', name: 'Study', color: '#FFEAA7' }
    ];
    
    this.defaultCategories = [...this.categories];
  }

  // User methods
  createUser(userData) {
    const user = {
      id: uuidv4(),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  // Todo methods
  createTodo(todoData) {
    const todo = {
      id: uuidv4(),
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      priority: todoData.priority || 'medium',
      category: todoData.category || 'personal',
      dueDate: todoData.dueDate || null,
      tags: todoData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.todos.push(todo);
    return todo;
  }

  getTodos() {
    return this.todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getTodoById(id) {
    return this.todos.find(t => t.id === id);
  }

  updateTodo(id, updates) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.todos[index];
  }

  deleteTodo(id) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.todos.splice(index, 1);
    return true;
  }

  // Category methods
  getCategories() {
    return this.defaultCategories;
  }

  // Stats methods
  getStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = this.todos.filter(t => t.priority === 'high' && !t.completed).length;
    
    const byCategory = {};
    this.defaultCategories.forEach(cat => {
      byCategory[cat.id] = {
        total: this.todos.filter(t => t.category === cat.id).length,
        completed: this.todos.filter(t => t.category === cat.id && t.completed).length
      };
    });

    const byPriority = {
      high: this.todos.filter(t => t.priority === 'high').length,
      medium: this.todos.filter(t => t.priority === 'medium').length,
      low: this.todos.filter(t => t.priority === 'low').length
    };

    return {
      total,
      completed,
      pending,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory,
      byPriority
    };
  }
}

module.exports = new DataStore();