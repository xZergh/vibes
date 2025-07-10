# Blog POC with Comments

This is a proof of concept for a self-hosted blog with comments functionality.

## Features

- Static blog using Hugo
- User authentication (register/login)
- Comments system with approval workflow
- PostgreSQL database for user and comment storage
- Express.js API backend

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- Hugo (extended version)

## Setup Instructions

1. **Set up the database:**

```bash
# Create database and initialize schema
sudo -u postgres psql -c "CREATE DATABASE blogdb;"
sudo -u postgres psql -c "CREATE USER bloguser WITH ENCRYPTED PASSWORD 'blogpass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE blogdb TO bloguser;"
sudo -u postgres psql -d blogdb -f setup/02-db-setup.sql
```

2. **Set up the backend:**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (or use the provided one)
cp .env.example .env

# Start the server
npm start
```

3. **Run the Hugo site**

```bash
# Navigate to frontend directory
cd frontend

# Start Hugo server
hugo server -D
```
4. **Access the site:**

Frontend: http://localhost:1313
Backend API: http://localhost:3000

5. **Default Admin Account:**

Email: admin@example.com
Password: admin123


6. **API Endpoints:**

*Authentication*

POST /api/auth/register - Register a new user
POST /api/auth/login - Login
GET /api/auth/user - Get current user info (requires auth)

*Comments*

GET /api/comments/:slug - Get comments for a post
POST /api/comments - Add a comment (requires auth)
DELETE /api/comments/:id - Delete a comment (requires auth)
GET /api/comments/admin/pending - Get pending comments (requires admin)
PUT /api/comments/admin/approve/:id - Approve a comment (requires admin)

**Project Structure**

blog-poc/
├── backend/             # Express.js API server
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── db.js            # Database connection
│   ├── package.json     # Node dependencies
│   └── server.js        # Main server file
└── frontend/            # Hugo static site
    ├── content/         # Blog content
    ├── layouts/         # Hugo templates
    ├── static/          # Static assets (JS, CSS)
    └── config.toml      # Hugo configuration
