# Store Rating App

Stack: Express + PostgreSQL (backend), React + Vite (frontend).

## Setup
1. Create DB: `createdb store_rating`
2. Backend:
   ```
   cd backend
   cp .env.example .env     # edit DATABASE_URL, JWT_SECRET
   npm install
   psql $DATABASE_URL -f schema.sql
   npm run seed             # admin@example.com / Admin@123
   npm start                # http://localhost:5000
   ```
3. Frontend:
   ```
   cd frontend
   npm install
   npm run dev              # http://localhost:5173
   ```

## Roles
- Admin: seeded. Dashboard, add users/stores, filter + sort lists, user details.
- Normal user: signup page. Search stores, rate 1-5, modify rating, change password.
- Store owner: created by admin (role "Store Owner"), then assign to a store via owner email in Add Store. Sees raters + average.

## Validation (frontend + backend)
- Name 20-60 chars, Address max 400, Password 8-16 with 1 uppercase + 1 special, valid email.

## Design notes
- Schema: users, stores (owner_id unique FK), ratings (UNIQUE user_id+store_id, CHECK 1-5).
- Passwords bcrypt hashed, JWT auth, role middleware.
- Sorting uses whitelisted ORDER BY columns. Queries parameterized.
