# 📝 ToDo App - Full Stack Application

A modern, feature-rich To-Do application built with React and Node.js.

## ✨ Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure password handling with bcrypt

### Task Management
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Priority levels (Low, Medium, High)
- Due date tracking
- Task categorization

### Categories
- Work (Red)
- Personal (Teal)
- Shopping (Blue)
- Health (Green)
- Study (Yellow)

### Dashboard
- Total tasks count
- Completed tasks count
- Pending tasks count
- High priority tasks count
- Completion rate percentage
- Category-wise breakdown

### UI/UX
- Beautiful gradient design
- Responsive layout
- Modal for adding/editing tasks
- Filter tasks by status
- Search functionality
- Category filtering

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- JWT Authentication
- In-memory data store (easily replaceable with database)

### Frontend
- React 18
- Axios for API calls
- React Icons
- Date-fns

### DevOps
- Docker & Docker Compose
- Jenkins CI/CD Pipeline

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd app

# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Running Locally

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run server    # Backend on port 8080
npm run client   # Frontend on port 3000
```

### Running with Docker

```bash
# Build and run
docker-compose up -d

# Access the app
# Frontend: http://localhost
# Backend API: http://localhost:8080/api
```

## 📁 Project Structure

```
app/
├── server/                 # Backend
│   ├── data/
│   │   └── store.js       # In-memory data store
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── todos.js       # Todo CRUD routes
│   │   ├── categories.js  # Category routes
│   │   └── stats.js       # Stats routes
│   ├── tests/
│   │   └── api.test.js    # API tests
│   └── index.js           # Express server
├── client/                # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Styles
│   └── package.json
├── Dockerfile             # Frontend Docker config
├── Dockerfile.server      # Backend Docker config
├── docker-compose.yml     # Docker Compose config
├── nginx.conf             # Nginx configuration
├── Jenkinsfile           # CI/CD pipeline
└── package.json          # Backend dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Todos
- `GET /api/todos` - Get all todos (supports filters)
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion
- `DELETE /api/todos/:id` - Delete todo

### Categories
- `GET /api/categories` - Get all categories

### Stats
- `GET /api/stats` - Get dashboard statistics

## 🎯 Example Usage

### Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

### Create a Todo
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete project", "priority": "high", "category": "work"}'
```

## 🚀 CI/CD Pipeline

The Jenkins pipeline includes:
1. Code checkout
2. Install dependencies
3. Run tests
4. Build React frontend
5. Build Docker image
6. Test Docker container
7. Push to Docker Hub
8. Deploy to staging
9. Deploy to production

## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ for learning DevOps and CI/CD!