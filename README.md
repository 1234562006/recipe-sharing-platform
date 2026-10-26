# 🍳 RecipeNest – Full Stack Recipe Sharing Platform

> **College Full Stack Development (FSD) Project**  
> Built with **Node.js**, **Express.js**, **MongoDB Atlas**, **Mongoose**, and **Vanilla JavaScript / HTML5 / CSS3**.

---

## 📖 Overview

**RecipeNest** is a complete, responsive, full-stack recipe sharing web application. Home chefs and culinary enthusiasts can register accounts, publish original recipes with ingredients and step-by-step instructions, explore recipes through real-time search and multi-criteria filtering, and curate their own collection of saved favorite dishes.

All backend operations are backed by a robust RESTful API with **bcrypt** password encryption, **JWT** session authentication, strict ownership authorization, and **MongoDB Atlas** cloud database persistence.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | HTML5, CSS3 (Modern Flexbox & Grid, CSS Custom Properties), Vanilla JavaScript (ES6+), Responsive Mobile Drawer |
| **Backend** | Node.js (v18+), Express.js REST API |
| **Database** | MongoDB Atlas (Cloud Cluster), Mongoose ODM (Schemas, Virtuals, Compound Indices) |
| **Authentication** | `bcryptjs` for salted password hashing, `jsonwebtoken` (JWT) for stateless token verification |
| **Security & Middleware** | `express-rate-limit` (brute-force defense), CORS, centralized error handling middleware |
| **Testing** | Node.js native test runner (`node:test`), `supertest`, `mongodb-memory-server` |

---

## 🗂️ Project Directory Structure

```text
recipe-sharing-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & diagnostic handler
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & ownership protection
│   │   ├── errorHandler.js       # Centralized error handler
│   │   └── rateLimiter.js        # Auth endpoint rate limiting
│   ├── models/
│   │   ├── User.js               # User model with bcrypt pre-save & safe toJSON
│   │   ├── Recipe.js             # Recipe model with text indices & virtuals
│   │   └── Favorite.js           # User-Recipe compound unique relationship
│   ├── routes/
│   │   ├── auth.js               # /api/auth (register, login, logout, me)
│   │   ├── recipes.js            # /api/recipes (CRUD, search, filters)
│   │   ├── favorites.js          # /api/favorites (add, remove, list)
│   │   └── users.js              # /api/users/me/recipes
│   ├── seed.js                   # 10 realistic sample recipes seed script
│   └── server.js                 # Express server & static frontend host
├── frontend/
│   ├── css/
│   │   └── styles.css            # Food-themed custom styling & animations
│   ├── js/
│   │   ├── api.js                # Reusable fetch client with auth headers
│   │   ├── auth.js               # Client auth state & protected route guards
│   │   ├── ui.js                 # Toast notifications, modals & SVG fallback
│   │   └── app.js                # Navbar toggle & dropdown controllers
│   ├── index.html                # Home page with hero, search & featured cards
│   ├── recipes.html              # Explore recipes with live filters & pagination
│   ├── recipe-details.html       # Full recipe view with interactive checklist
│   ├── add-recipe.html           # Dynamic ingredient & step recipe creator
│   ├── edit-recipe.html          # Recipe editing interface (author only)
│   ├── my-recipes.html           # User-authored recipe management
│   ├── favorites.html            # User bookmarked favorites collection
│   ├── profile.html              # Chef profile with security & activity stats
│   ├── login.html                # Secure sign-in with 1-click demo filler
│   ├── register.html             # User registration with input validation
│   ├── about.html                # Architecture & technology overview
│   └── contact.html              # Interactive feedback form & FAQ accordion
├── test/
│   └── api.test.js               # Automated end-to-end integration test suite
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file (excludes secrets & node_modules)
├── package.json                  # Dependencies and execution scripts
└── README.md                     # Beginner-friendly setup documentation
```

---

## 📋 Prerequisites

Before running the application, make sure you have installed:
1. **Node.js** (v18.0.0 or higher) – [Download Node.js](https://nodejs.org/)
2. **npm** (comes bundled with Node.js)
3. A free **MongoDB Atlas** account – [Sign Up at MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
4. A modern web browser (Google Chrome, Firefox, Safari, or Microsoft Edge)

---

## 🚀 Quick Setup & Installation Guide

### Step 1: Navigate to the Project Folder
Open your terminal or PowerShell and change into the project directory:
```bash
cd recipe-sharing-platform
```

### Step 2: Install Node.js Dependencies
Install all required production and testing packages:
```bash
npm install
```

---

### Step 3: MongoDB Atlas Cluster & Credentials Setup

1. Go to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. **Create a Free Cluster** (M0 Shared cluster tier).
3. **Configure Database Access (User)**:
   - In the left sidebar, click **Database Access** under *Security*.
   - Click **Add New Database User**.
   - Choose **Password** authentication method.
   - Enter a username (e.g. `recipenest_admin`) and a secure password.
   - Set user privileges to **Read and write to any database**.
   - Click **Add User**.
4. **Configure Network Access (IP Whitelist)**:
   - In the left sidebar, click **Network Access** under *Security*.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current IP.
   - Click **Confirm**.
5. **Get Your Connection String**:
   - In the left sidebar, click **Database** under *Deployment*.
   - Click the **Connect** button on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     ```

---

### Step 4: Configure the `.env` File

Create a `.env` file in the root `recipe-sharing-platform` folder (or copy `.env.example`):

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```
**On Linux / macOS:**
```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in your MongoDB Atlas connection string:
```ini
PORT=3000
NODE_ENV=development

# Paste your actual connection string below (replace <username> and <password>):
MONGODB_URI=mongodb+srv://recipenest_admin:YourSecurePassword123@cluster0.abcde.mongodb.net/recipenest?retryWrites=true&w=majority

SESSION_SECRET=super_secure_college_fsd_secret_key_recipenest_2026
JWT_SECRET=super_secure_college_fsd_secret_key_recipenest_2026
JWT_EXPIRES_IN=7d
```

> **Note:** Replace `<password>` with your actual database user password and make sure the database name (e.g. `/recipenest`) is added before the query parameters.

---

### Step 5: Seed Sample Recipes (Optional but Recommended)

To populate your database with **10 high-quality gourmet recipes** across Breakfast, Lunch, Dinner, Snacks, Desserts, and Beverages, run:
```bash
npm run seed
```

This will automatically create a demo chef account:
- **Email:** `chef@recipenest.com`
- **Password:** `ChefPass123!`

---

### Step 6: Start the Server

Run the start command:
```bash
npm start
```

For automatic server reload during development:
```bash
npm run dev
```

You should see console output confirming:
```text
======================================================
  🍳 RecipeNest Server Running Successfully!
  🌐 Website URL : http://localhost:3000
  🩺 API Health  : http://localhost:3000/api/health
  📚 Environment : development
======================================================
[Database] MongoDB Connected successfully: cluster0-shard-00-00... (DB: recipenest)
```

---

### Step 7: Open the Application in Your Browser

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🧪 Running the Automated Test Suite

RecipeNest includes an automated end-to-end integration test suite using Node's native test runner (`node:test`) and an isolated in-memory MongoDB server (`mongodb-memory-server`).

To execute all tests without affecting your live Atlas database:
```bash
npm test
```

### Verified Test Cases Covered:
- **Health check:** Verifies `/api/health` returns status `200 OK`.
- **Validation:** Missing name, invalid email, short password (<6 chars).
- **Registration:** Successful registration, JWT token generation, password excluded from payload.
- **Duplicate Prevention:** Prevents duplicate user registrations with the same email.
- **Authentication:** Valid vs invalid password handling.
- **Route Protection:** Rejection of unauthenticated requests to protected endpoints.
- **Recipe CRUD:** Create, read, update, delete recipes.
- **Search & Filters:** Title/ingredient text search, category filtering, difficulty filtering, maxTime filtering.
- **Invalid ID Handling:** Returns `400 Bad Request` on non-ObjectId strings, `404 Not Found` on non-existent IDs.
- **Ownership Authorization:** Verifies that User B **cannot** modify or delete recipes authored by User A (`403 Forbidden`).
- **Favorites System:** Add to favorites, compound unique constraint preventing duplicate bookmarks, list favorites, remove from favorites.

---

## 📡 REST API Documentation

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (name, email, password) | Public (Rate-limited) |
| `POST` | `/api/auth/login` | Log in user and receive JWT | Public (Rate-limited) |
| `POST` | `/api/auth/logout` | Clear session/cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private (Bearer Token) |

### Recipe Endpoints (`/api/recipes`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/recipes` | List recipes (supports search, category, difficulty, maxTime, sort, page) | Public |
| `GET` | `/api/recipes/:id` | Get full recipe details by ID | Public |
| `POST` | `/api/recipes` | Create a new recipe | Private |
| `PUT` | `/api/recipes/:id` | Update existing recipe (author only) | Private (Author) |
| `DELETE` | `/api/recipes/:id` | Delete recipe (author only) | Private (Author) |

### User Recipes Endpoints (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/users/me/recipes` | List all recipes authored by the logged-in user | Private |

### Favorites Endpoints (`/api/favorites`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/favorites` | List all recipes bookmarked by the user | Private |
| `POST` | `/api/favorites/:recipeId` | Add recipe to user's favorites | Private |
| `DELETE` | `/api/favorites/:recipeId` | Remove recipe from user's favorites | Private |

### System Health (`/api/health`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime and database connection status | Public |

---

## 🛡️ Security Best Practices Implemented

1. **Password Salting & Hashing:** Passwords are never stored in plain text. Mongoose `pre('save')` hooks hash passwords using `bcryptjs` with 10 salt rounds.
2. **Zero Password Leakage:** Schema-level projection (`select: false`) and `toJSON()` method overrides strip the password field from all JSON API responses.
3. **Compound Unique Indexing:** The `Favorite` model enforces `{ user: 1, recipe: 1 }` unique indexing to physically prevent duplicate favorites in the database.
4. **Ownership Verification:** Every `PUT` and `DELETE` operation verifies that `req.user._id` matches `recipe.author._id`, returning `403 Forbidden` if unauthorized.
5. **Rate Limiting:** Authentication routes are protected with `express-rate-limit` to prevent credential-stuffing and brute-force attacks.
6. **Graceful Asset Fallback:** If an image URL is broken or blocked, the UI gracefully renders an inline SVG placeholder so the page never breaks.

---

## ❓ Troubleshooting & Common Issues

| Issue | Cause | Solution |
|---|---|---|
| `MongooseServerSelectionError: connect ECONNREFUSED` | MongoDB Atlas IP whitelist blocking connection | Go to Atlas &rarr; **Network Access** &rarr; Add `0.0.0.0/0` (Allow Access from Anywhere). |
| `bad auth : Authentication failed` | Incorrect username or password in `MONGODB_URI` | In Atlas &rarr; **Database Access**, verify user credentials. If password has special characters (`@`, `#`), URL-encode them. |
| `EADDRINUSE: address already in use :::3000` | Port 3000 is occupied by another process | Change `PORT=3001` in `.env` or terminate the process using port 3000. |
| Recipes not displaying | Database has not been seeded yet | Run `npm run seed` to insert the 10 starter gourmet recipes. |

---

## 🎓 College FSD Evaluation Checklist

- [x] Complete working Full-Stack application (Frontend + Backend + DB).
- [x] Responsive layout across Mobile, Tablet, and Desktop.
- [x] MongoDB Atlas cloud database integration with Mongoose ODM.
- [x] Bcrypt password hashing & JWT authentication middleware.
- [x] Public recipe exploration with text search & multi-field filtering.
- [x] Full CRUD functionality for recipes with ownership checks.
- [x] Favorites bookmarking system with duplicate prevention.
- [x] Dynamic ingredient and instruction step builders on frontend.
- [x] Comprehensive test suite with automated execution verification.
- [x] Detailed documentation with configuration and error handling.
