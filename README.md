# 🏆 Champions Travels Backend - Node.js API

Welcome to the **Champions Travels Backend**, the server-side application that powers [Champions Travels Frontend](https://github.com/adptCode/champions-travels-front). This backend is built using **Node.js**, **Express.js**, and **Sequelize**, providing a robust and scalable API for travel management.

---

## 🌟 Features
- **Node.js & Express.js**: Lightweight and efficient server framework.
- **Sequelize ORM**: Manages database interactions for both **MySQL (Development)** and **PostgreSQL (Production)**.
- **JWT Authentication**: Secure authentication and authorization using **JSON Web Tokens**.
- **Firebase Storage & Firebase Admin**: Handles file uploads and user management.
- **RESTful API**: Clean and structured endpoints for managing travel-related data.

---

## 📋 Installation Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/adptCode/champions-travels-back.git
cd champions-travels-back
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
# Server Configuration
PORT=5000

# Database Configuration
DB_DIALECT=mysql  # Use "postgres" in production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=champions_travels_dev

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

### 4️⃣ Database Setup
#### 📌 Development (MySQL)
Ensure you have **MySQL** installed and running, then create the database manually or run migrations:
```bash
npx sequelize-cli db:migrate
```

#### 🚀 Production (PostgreSQL)
In a production environment, ensure **PostgreSQL** is set up and modify `DB_DIALECT=postgres` in `.env`.

### 5️⃣ Start the Server
```bash
npm start
```
The server will run at `http://localhost:5000/`.

---

## 📂 Project Structure
```
champions-travels-back/
│── src/
│   ├── models/       # Sequelize models
│   ├── controllers/  # API business logic
│   ├── routes/       # Express routes
│   ├── middleware/   # Authentication & validation
│   ├── config/       # Database configuration
│   ├── services/     # Firebase & other services
│   ├── app.js        # Main application file
│── migrations/       # Sequelize migrations
│── .env.example      # Example environment variables
│── package.json      # Project dependencies & scripts
└── README.md         # Project documentation
```

---

## 🔗 API Endpoints

### 🛡️ Authentication
| Method | Endpoint                  | Description                   |
|--------|--------------------------|-------------------------------|
| POST   | `/auth/register`         | Register a new user           |
| POST   | `/auth/login`            | Authenticate and obtain a JWT token |
| POST   | `/auth/forgot-password`  | Request password reset        |
| POST   | `/auth/change-password`  | Change password with token    |
| GET    | `/auth/logout`           | Logout the current user       |
| GET    | `/auth/me`               | Get current logged-in user    |

### 🎟️ Events
| Method | Endpoint                      | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/events/`                     | Get all events                 |
| GET    | `/events/:id`                  | Get event by ID                |
| POST   | `/events/`                     | Create a new event (Admin)     |
| PATCH  | `/events/:id`                  | Update event details (Admin)   |
| DELETE | `/events/:id`                  | Delete an event (Admin)        |
| PATCH  | `/events/:id/upload-photo`     | Upload event photo (Admin)     |
| DELETE | `/events/:id/delete-photo`     | Delete event photo (Admin)     |
| POST   | `/events/:id/participate`      | Participate in an event        |
| GET    | `/events/:id/participants`     | Get list of participants       |
| DELETE | `/events/:id/leave`            | Leave an event                 |

### 👤 Users
| Method | Endpoint                       | Description                      |
|--------|---------------------------------|----------------------------------|
| GET    | `/users/`                      | Get all users                    |
| GET    | `/users/:id`                   | Get user by ID                   |
| GET    | `/users/:id/events`            | Get events of a user             |
| PATCH  | `/users/`                      | Update user profile              |
| POST   | `/users/upload-photo`          | Upload user profile photo        |
| DELETE | `/users/delete-photo`          | Delete user profile photo        |
| POST   | `/users/preferences`           | Add user preference              |
| DELETE | `/users/preferences`           | Remove user preference           |
| DELETE | `/users/:userId/events/:eventId` | Remove user from an event (Admin) |

---

## 🔐 Authentication & Security
- Uses **JWT (JSON Web Tokens)** for user authentication.
- Secured API endpoints require a valid token in the `Authorization` header.

Example usage:
```bash
curl -H "Authorization: Bearer your_token_here" http://localhost:5000/trips
```

---

## 📦 Firebase Integration
- **Firebase Admin SDK**: Used for managing authentication and file uploads.
- **Firebase Storage**: Secure storage for user-uploaded files.

Example file upload flow:
```javascript
const file = req.file;
const bucket = admin.storage().bucket();
const uploadResponse = await bucket.upload(file.path, { destination: `uploads/${file.filename}` });
```

---

## 🛠️ Available Scripts

- **`npm start`** - Starts the server.
- **`npm run dev`** - Runs the server in development mode with live reload.
- **`npx sequelize-cli db:migrate`** - Applies database migrations.
- **`npx sequelize-cli db:seed:all`** - Populates database with seed data.

For a complete list of available scripts and their descriptions, refer to the `package.json` file.

---

## 🤝 Contributing
Contributions are welcome! If you have suggestions for improvements or encounter any issues, feel free to open an issue or submit a pull request. Please ensure that your contributions align with the project's coding standards and conventions.

---

## 📜 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

---

🏆 **Let's make travel experiences seamless!**

