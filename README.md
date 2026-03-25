# Affordacity 🏙️💰

**Affordacity** is a full-stack web application that helps users determine whether a city is financially affordable for them. By entering their annual salary and selecting a city, users receive an instant breakdown of estimated monthly rent, living costs, and disposable income — giving them a clear picture of their financial situation in any city.

🔗 **Live Demo:** [https://affordacity.onrender.com](https://affordacity-frontend.onrender.com)

---

## Features

- 🔐 **User Authentication** — Secure registration and login using JWT and bcrypt password hashing
- 🌍 **City Selection** — Browse cities stored in the database, each with cost-of-living, rent, groceries, and restaurant indices
- 📊 **Affordability Calculator** — Enter your annual salary to get an instant breakdown of estimated monthly rent, living costs, and disposable income
- 💾 **Calculation History** — Save, view, edit, and delete past calculations, all persisted per user in MongoDB
- 🔔 **Real-time Feedback** — Toast notifications for success, errors, and info messages throughout the app

---

## Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React, Material UI (MUI), Axios      |
| Backend     | Node.js, Express                     |
| Database    | MongoDB (via Mongoose)               |
| Auth        | JSON Web Tokens (JWT), bcrypt        |
| Dev Tools   | Nodemon, Concurrently                |
| Deployment  | Render                               |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- A [MongoDB](https://www.mongodb.com/) database (Atlas)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Anyalex22/affordacity.git
cd affordacity
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd frontend
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables) below).

5. **Run the app in development mode**

From the `backend/` directory, run both the server and client concurrently:

```bash
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAPIDAPI_KEY=your_rapidapi_key
PORT=5000
```

| Variable       | Description                                              |
|----------------|----------------------------------------------------------|
| `MONGODB_URI`  | MongoDB connection string (Atlas URI )           |
| `JWT_SECRET`   | Secret key used to sign and verify JWT tokens            |
| `RAPIDAPI_KEY` | API key for the Cities Cost of Living RapidAPI           |
| `PORT`         | Port for the Express server (defaults to 5000)           |

---

## API Endpoints

### Auth

| Method | Endpoint         | Description                        | Auth Required |
|--------|------------------|------------------------------------|---------------|
| POST   | `/api/register`  | Register a new user                | No            |
| POST   | `/api/login`     | Log in and receive a JWT token     | No            |

### Cities

| Method | Endpoint          | Description                                  | Auth Required |
|--------|-------------------|----------------------------------------------|---------------|
| GET    | `/api/cities`     | Get all cities stored in the database        | No            |
| GET    | `/api/all-cities` | Get all countries and cities (external API)  | No            |
| POST   | `/api/cities`     | Manually add a city with cost indices        | No            |

### Calculator

| Method | Endpoint           | Description                                    | Auth Required |
|--------|--------------------|------------------------------------------------|---------------|
| POST   | `/api/calculate`   | Calculate affordability for a city and salary  | No            |

### Calculations (User History)

| Method | Endpoint                    | Description                             | Auth Required |
|--------|-----------------------------|-----------------------------------------|---------------|
| GET    | `/api/user-calculations`    | Get all saved calculations for the user | ✅ Yes        |
| POST   | `/api/save-calculation`     | Save a new calculation                  | ✅ Yes        |
| PUT    | `/api/update-calculation`   | Update the salary on a saved calculation| ✅ Yes        |
| DELETE | `/api/delete-calculation`   | Delete a saved calculation              | ✅ Yes        |

---

## Project Structure

```
affordacity/
├── backend/
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # Mongoose User schema
│   │   ├── CityCost.js           # Mongoose City Cost schema
│   │   └── Calculations.js       # Mongoose Calculation schema
│   ├── routes/
│   │   ├── authRoutes.js         # Register & login routes
│   │   └── calculationsRoutes.js # User calculation history routes
│   ├── server.js                 # Express server, DB connection, core routes
│   ├── index.js
│   ├── package-lock.json
│   ├── seedCityCost.js
│   ├── .env                   # Environment variables (not committed)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js         # Axios instance with base URL & auth headers
    │   ├── components/
    │   │   ├── ErrorBoundary.js
    │   │   └── EmptyState.js
    │   ├── App.js                # Main app component with calculator & history
    │   ├── LoginPage.js          # Login and registration UI
    │   ├── Dashboard.js          # Dashboard view
    │   ├── Calculator.js         # Calculator component
    │   ├── ErrorBoundary.js      # React error boundary
    │   ├── EmptyState.js         # Empty state UI component
    │   └── index.js              # React entry point
    └── package.json
```

---

## How It Works

1. **Register or log in** to access the calculator
2. **Select a country and city** from the dropdown (populated from the database)
3. **Enter your annual salary**
4. Click **Calculate Affordability** to see:
   - Your estimated monthly salary
   - Estimated monthly rent for that city
   - Estimated monthly living costs
   - Your disposable income
   - An **Affordable** or **Not Affordable** verdict
5. Results are automatically **saved to your history**, where you can edit or delete them at any time

---

## Known Limitations & Future Improvements

- **Approximated cost data** — Rent and living cost estimates are derived from cost-of-living indices rather than real-time market prices. Results should be used as a general guide.
- **Limited city database** — The database currently covers a curated set of cities. Full global coverage is a planned improvement.
- **Currency** — All values are displayed in USD. Multi-currency support is a potential future feature.
- **Single-user token expiry** — JWT tokens expire after 1 hour. A refresh token flow could improve the user experience.

---

## License
This project is licensed under the MIT License.
