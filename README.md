# Sankhya – Smart Expense Tracker

## 1. Project Overview
**Sankhya** is a modern, responsive, full-stack MERN application built to seamlessly manage personal finances. It allows users to securely register, log in, and track their expenses. Users can categorize, visualize, and filter their spending habits efficiently, featuring a highly polished React UI and a scalable, robust Node.js/MongoDB backend infrastructure. 

Designed with performance and user experience in mind, Sankhya handles massive datasets smoothly through offset-based pagination using skip() and limit() and fluid frontend interaction.

---

## 2. Key Features

### 🔐 Security & Authentication
*   **JWT-Based Authentication:** Stateless and secure session management.
*   **Password Hashing:** Uses `bcryptjs` to safely encrypt user passwords.
*   **Protected Routes:** Custom Express middleware blocks unauthorized backend access, and React Router guards frontend views.
*   **Token Expiry:** 30-day secure session duration.

### 📊 Expense Management & Analytics
*   **Full CRUD:** Add, update, view, and delete expenses instantly.
*   **Advanced Filtering:** Filter transactions by category (Food, Transport, Bills, etc.) and timeframes (All, This Week, This Month, This Year).
*   **Dynamic Data Visualization:** Real-time spending breakdown pie charts powered by `Recharts`.
*   **Global Summary:** Live aggregation calculates total expenditures and transaction counts.
*   **CSV Export:** One-click download of filtered transaction history for external spreadsheet use.

### 📦 Scalable Data Handling
*   **Massive Dataset Safe:** "Load More" pagination effortlessly supports user accounts with 10,000+ transaction records.

### 🎨 Modern UI/UX
*   **Responsive Design:** Beautifully scales across mobile, tablet, and desktop viewports.
*   **Glassmorphism Aesthetic:** Premium "frosted glass" layered styling using `TailwindCSS`.

---

## 3. Architecture Explanation
Sankhya follows the classic **MERN Stack** (MongoDB, Express, React, Node.js) with an **MVC** (Model-View-Controller) backend pattern.

*   **Frontend (React + Vite):** Handles the UI rendering, state management, and user interactions. Built with Vite for rapid HMR (Hot Module Replacement) and optimized bundling.
*   **Backend (Node.js + Express):** Stateless RESTful API server. Validates client requests, enforces business logic, and manages the database connection.
*   **Database (MongoDB Atlas):** A NoSQL cloud-hosted database. Data is interfaced using the `Mongoose` Object Data Modeling (ODM) library for strict schema validation.

---

## 4. Authentication Flow
1.  **Registration/Login:** User submits credentials to `/api/auth/register` or `/login`.
2.  **Validation & Hashing:** Backend verifies data, hashes passwords (if registering), or checks hashes against the DB (if logging in).
3.  **Token Generation:** A JWT (JSON Web Token) is generated containing the user's ID, signed with a secret key, and returned to the client.
4.  **Storage:** The React frontend stores the JWT in `localStorage`.
5.  **Subsequent Requests:** The frontend attaches the token as a `Bearer` token inside the `Authorization` header for all requests to protected `/api/expenses/*` routes.
6.  **Verification:** The backend `authMiddleware` intercepts requests, decrypts the token, attaches the `req.user` payload, and permits the controller to execute.

---

## 5. Efficient Pagination
To prevent memory exhaustion and slow load times when users accumulate thousands of expenses, Sankhya implements a robust **"Load More" pagination system**.

*   **Backend Mechanism:** The API utilizes Mongoose's `.skip()` and `.limit()` chainable methods. It retrieves exactly 10 expenses per cycle.
*   **Frontend Implementation:** Acts as an "infinite scroll" pattern via an explicit button. Clicking "Load More Data" increments the page state, fetches the next batch of 10 records, and appends them to the existing UI list seamlessly.

---

## 6. Database Schema
Sankhya utilizes two highly structured Mongoose collections.

### User Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Expense Model
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., 'Food', 'Bills'
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 7. Project Folder Structure
```text
Sankhya/
├── backend/                  # Node.js REST API
│   ├── config/               # DB Connection (db.js)
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT Protection & Error handling
│   ├── models/               # Mongoose Schemas (User.js, Expense.js)
│   ├── routes/               # Express routing (authRoutes, expenseRoutes)
│   ├── server.js             # Express app entry point
│   └── package.json          
│
└── frontend/                 # Vite + React Client
    ├── public/
    ├── src/
    │   ├── components/       # Reusable UI (Navbar, ProtectedRoute)
    │   ├── pages/            # View components (Login, Register, Dashboard)
    │   ├── services/         # Axios API interceptors & networking
    │   ├── App.jsx           # React Router DOM configuration
    │   ├── main.jsx          # React DOM entry
    │   └── index.css         # TailwindCSS directives & globals
    ├── tailwind.config.js    
    ├── vite.config.js        
    └── package.json          
```

---

## 8. Installation Steps

### Prerequisites
*   Node.js (v18+ recommended)
*   A MongoDB Atlas account (or local MongoDB server)

### 1. Clone the repository
```bash
git clone https://github.com/SyedRoshannn/sankhya.git
cd sankhya
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

---

## 9. Environment Variables
You must create `.env` files in both the `backend` and `frontend` directories.

**`backend/.env`**
```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sankhya

# JWT Secret Key (Use a strong random string)
JWT_SECRET=super_secret_jwt_key_here
```

**`frontend/.env`**
*(Note: Because Vite proxies API requests in development, VITE_API_URL is primarily required for production deployments)*
```env
VITE_API_URL=http://localhost:5000
```

---

## 10. Core API Documentation

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/api/auth/register` | Register a new user account | ❌ |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT token | ❌ |
| **GET** | `/api/expenses` | Retrieve paginated user expenses | ✅ |
| **GET** | `/api/expenses?category=Food` | Filter expenses dynamically via query | ✅ |
| **GET** | `/api/expenses/summary` | Retrieve total expenses & count | ✅ |
| **POST** | `/api/expenses` | Create a new transaction | ✅ |
| **PUT** | `/api/expenses/:id` | Update an existing transaction | ✅ |
| **DELETE** | `/api/expenses/:id` | Delete a single transaction | ✅ |

---

## 11. AI Usage Disclosure
This project was developed responsibly utilizing AI assistance:
*   **ChatGPT / Antigravity Agent:** Utilized for rapid scaffolding, CSS/Tailwind design ideation, and debugging complex structural code logic (e.g., Recharts viewport dimensions, Mongoose aggregation pipelines). All generated code was manually reviewed, structured, and integrated by the developer to fulfill precise architectural requirements.

---

## 12. Future Improvements
*   **Dark Mode Toggle:** A user-selectable dark theme toggle leveraging Tailwind's `dark:` classes.
*   **Recurring Expenses:** Allow users to flag expenses as "monthly subscriptions" that auto-populate.
*   **Budgeting System:** Allow users to set hard limits on specific categories and receive visual warning states.
*   **OAuth Integration:** Support Google/GitHub one-click SSO login.

---

## 13. Developer
Developed as a comprehensive, production-ready Full-Stack internship/portfolio project demonstrating competency in React dynamics, REST API architecture, and scalable NoSQL database design.

---

## 🗄 Database Schema

The database utilizes MongoDB and Mongoose with two core collections.

### User Model
- `_id` (ObjectId)
- `name` (String)
- `email` (String, unique)
- `password` (Hashed String) - *Password is hashed using bcrypt before storage.*
- `createdAt` (Date)

### Expense Model
- `_id` (ObjectId)
- `user` (ObjectId, ref: User) - *Expenses are linked to users via ObjectId reference.*
- `title` (String)
- `amount` (Number)
- `category` (String)
- `date` (Date)
- `createdAt` (Date)

---

## 📡 API Endpoints

**Backend Base URL:**  
https://sankhya-expense-tracker.onrender.com

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/api/auth/register` | Register a new user account | ❌ |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT token | ❌ |
| **GET** | `/api/expenses` | Retrieve user expenses | ✅ |
| **POST** | `/api/expenses` | Create a new transaction | ✅ |
| **PUT** | `/api/expenses/:id` | Update an existing transaction | ✅ |
| **DELETE** | `/api/expenses/:id` | Delete a single transaction | ✅ |
| **GET** | `/api/expenses/summary`| Retrieve total expenses & count | ✅ |
| **GET** | `/api/expenses/export` | Export expenses data to CSV format | ✅ |

---

## 🏗 Planning & Design Approach

- **Project Structure Separation:** Follows the MVC (Model-View-Controller) architecture in the backend for clean separation of concerns.
- **JWT-Based Authentication Strategy:** Utilizes stateless JSON Web Tokens for secure session management.
- **Environment-Based Configuration:** Strict separation of environment variables for local development vs. production deployments.
- **Pagination Approach:** Implementation of offset-based pagination via MongoDB's `.skip()` and `.limit()` queries.
- **Deployment Architecture:** 
  - Frontend hosted on Vercel
  - Backend hosted on Render
  - Database managed on MongoDB Atlas
- **Security Considerations:** Features securely hashed passwords via `bcryptjs`, and robust Express auth middleware for protecting routes.

---

## 🤖 Use of AI Tools

AI tools (ChatGPT) were used for:
- Brainstorming feature enhancements
- Improving documentation structure
- Debugging deployment and configuration issues
- Reviewing best practices

Core implementation logic, authentication flow, API integration, and deployment configuration were implemented and reviewed manually.

---

## 📱 Responsive Design

- The UI is built purely using **Tailwind CSS**.
- The layout dynamically adapts for both mobile and desktop viewports.
- Forms and dashboards are highly optimized for small screens, ensuring mobile accessibility.
- Advanced Flexbox techniques and responsive Tailwind breakpoints (`md:`, `lg:`) were used.
- The application was stringently tested across device contexts using Chrome DevTools responsive mode.

---

## 🌍 Live Demo

**Frontend:**  
https://sankhya-expense-tracker.vercel.app

**Backend:**  
https://sankhya-expense-tracker.onrender.com
