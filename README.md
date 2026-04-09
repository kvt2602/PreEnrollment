
# Pre Enrolment System (Copy)

This project uses:

- React + Vite frontend
- Node.js (Express) API
- MySQL database
- phpMyAdmin (from XAMPP) for DB management

## 1. Install dependencies

From project root:

```bash
npm install
```

From backend folder:

```bash
cd backend
npm install
cd ..
```

## 2. Start MySQL and phpMyAdmin in XAMPP

1. Open XAMPP Control Panel.
2. Start Apache and MySQL.
3. Open phpMyAdmin from XAMPP (usually http://localhost/phpmyadmin).
4. Create database: pre_enrolment.
5. Import backend/db/init.sql into the pre_enrolment database.

## 3. Configure backend environment

Create backend/.env from backend/.env.example and set values for XAMPP:

- PORT=4000
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD= (empty in many XAMPP setups)
- DB_NAME=pre_enrolment
- CORS_ORIGIN=http://localhost:3000

## 4. Start backend API

```bash
npm run api:dev
```

API health check: http://localhost:4000/api/health

## 5. Start frontend

```bash
npm run dev
```

Frontend runs at http://localhost:3000 and proxies /api requests to the Node API.

## 6. Useful commands

```bash
npm run api:dev
npm run api:start
```

## Notes

- Demo accounts are automatically seeded into MySQL.
- The Reset button on login now resets backend demo data.
  