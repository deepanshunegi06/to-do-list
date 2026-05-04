import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTrash, FaEdit, FaPlus, FaSearch, FaSignOutAlt, FaCalendar, FaFlag, FaTag } from 'react-icons/fa';

const API_URL = 'http://localhost:8080/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: ''
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [todosRes, statsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTodos(todosRes.data.todos);
      setStats(statsRes.data);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
      const res = await axios.post(`${API_URL}${endpoint}`, authForm);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (error) {
      alert(error.response?.data?.error || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTodo) {
        await axios.put(`${API_URL}/todos/${editingTodo.id}`, todoForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/todos`, todoForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchData();
      setShowModal(false);
      setEditingTodo(null);
      setTodoForm({ title: '', description: '', priority: 'medium', category: 'personal', dueDate: '' });
    } catch (error) {
      alert('Failed to save todo');
    }
    setLoading(false);
  };

  const toggleTodo = async (id) => {
    try {
      await axios.patch(`${API_URL}/todos/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      await axios.delete(`${API_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setTodoForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTodos([]);
  };

  const getFilteredTodos = () => {
    let filtered = [...todos];
    
    if (search) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (filter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter === 'high') {
      filtered = filtered.filter(t => t.priority === 'high' && !t.completed);
    }

    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    return filtered;
  };

  const getCategoryStats = (categoryId) => {
    return {
      total: todos.filter(t => t.category === categoryId).length,
      completed: todos.filter(t => t.category === categoryId && t.completed).length
    };
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-logo">
            <h1>📝 ToDo App</h1>
            <p>Stay organized, stay productive</p>
          </div>
          <form onSubmit={handleAuth}>
            {view === 'register' && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">
            {view === 'login' ? (
              <>Don't have an account? <a href="#" onClick={() => setView('register')}>Sign up</a></>
            ) : (
              <>Already have an account? <a href="#" onClick={() => setView('login')}>Sign in</a></>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>📝 ToDo App</h1>
        <div className="header-actions">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span>{user?.name || 'User'}</span>
          </div>
          <button className="btn btn-secondary" onClick={logout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="value success">{stats.completed}</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="value warning">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <h3>High Priority</h3>
            <div className="value danger">{stats.highPriority}</div>
          </div>
        </div>
      )}

      <div className="main-content">
        <div className="todo-section">
          <div className="section-header">
            <h2>My Tasks</h2>
            <div className="filters">
              {['all', 'pending', 'completed', 'high'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="search-box" style={{ marginBottom: '20px' }}>
            <FaSearch style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="todo-list">
            {getFilteredTodos().length === 0 ? (
              <div className="empty-state">
                <p>No tasks found. Add your first task!</p>
              </div>
            ) : (
              getFilteredTodos().map(todo => (
                <div key={todo.id} className="todo-item">
                  <div
                    className={`todo-checkbox ${todo.completed ? 'completed' : ''}`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed && <FaCheck size={12} />}
                  </div>
                  <div className="todo-content">
                    <div className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                      {todo.title}
                    </div>
                    {todo.description && (
                      <div className="todo-description">{todo.description}</div>
                    )}
                    <div className="todo-meta">
                      <span className={`todo-tag priority-${todo.priority}`}>
                        <FaFlag /> {todo.priority}
                      </span>
                      <span className="todo-tag category-tag">
                        <FaTag /> {todo.category}
                      </span>
                      {todo.dueDate && (
                        <span className={`due-date ${new Date(todo.dueDate) < new Date() && !todo.completed ? 'overdue' : ''}`}>
                          <FaCalendar /> {formatDate(todo.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="todo-actions">
                    <button className="action-btn" onClick={() => openEditModal(todo)}>
                      <FaEdit />
                    </button>
                    <button className="action-btn delete" onClick={() => deleteTodo(todo.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="add-todo-card">
            <h3>Add New Task</h3>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTodo(null);
                setTodoForm({ title: '', description: '', priority: 'medium', category: 'personal', dueDate: '' });
                setShowModal(true);
              }}
            >
              <FaPlus /> Add Task
            </button>
          </div>

          <div className="categories-card">
            <h3>Categories</h3>
            <div className="category-list">
              <div
                className={`category-item ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                <span>All</span>
                <span className="category-count">{todos.length}</span>
              </div>
              {categories.map(cat => {
                const catStats = getCategoryStats(cat.id);
                return (
                  <div
                    key={cat.id}
                    className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="category-color" style={{ background: cat.color }}></span>
                      <span>{cat.name}</span>
                    </div>
                    <span className="category-count">{catStats.completed}/{catStats.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTodo ? 'Edit Task' : 'Add New Task'}</h2>
            <form onSubmit={handleAddTodo}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={todoForm.title}
                  onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={todoForm.description}
                  onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={todoForm.priority}
                  onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={todoForm.category}
                  onChange={(e) => setTodoForm({ ...todoForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={todoForm.dueDate}
                  onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingTodo ? 'Update' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;