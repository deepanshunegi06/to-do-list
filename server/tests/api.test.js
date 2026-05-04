const request = require('supertest');
const app = require('../index');

describe('API Tests', () => {
  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('ToDo API is running!');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it('should not register duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'duplicate@test.com', password: 'password123', name: 'Test' });
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'duplicate@test.com', password: 'password123', name: 'Test' });
      
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'login@test.com', password: 'password123', name: 'Login Test' });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'password123' });
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'wrongpass@test.com', password: 'password123', name: 'Wrong Pass' });
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongpass@test.com', password: 'wrongpassword' });
      
      expect(res.status).toBe(401);
    });
  });

  describe('Todo CRUD', () => {
    let token;
    
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'todo@test.com', password: 'password123', name: 'Todo Test' });
      token = res.body.token;
    });

    it('should create a todo', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Todo', priority: 'high', category: 'work' });
      
      expect(res.status).toBe(201);
      expect(res.body.todo.title).toBe('Test Todo');
    });

    it('should get all todos', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.todos).toBeDefined();
    });

    it('should toggle todo completion', async () => {
      const todoRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Toggle Test', priority: 'medium', category: 'personal' });
      
      const todoId = todoRes.body.todo.id;
      
      const res = await request(app)
        .patch(`/api/todos/${todoId}/toggle`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.todo.completed).toBe(true);
    });

    it('should delete a todo', async () => {
      const todoRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Test', priority: 'low', category: 'shopping' });
      
      const todoId = todoRes.body.todo.id;
      
      const res = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/stats', () => {
    it('should return stats', async () => {
      const res = await request(app)
        .get('/api/stats');
      
      expect(res.status).toBe(200);
      expect(res.body.total).toBeDefined();
    });
  });
});