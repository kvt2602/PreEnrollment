# Pre Enrolment System

## Overview

This project is a pre-enrolment platform for CIHE with:

- React + Vite frontend
- Node.js (Express) backend API
- MySQL database

## Tech Stack

- Frontend: React, Vite, Tailwind/UI components
- Backend: Express, MySQL
- Database tools: XAMPP MySQL + phpMyAdmin (recommended for local setup)

## Prerequisites

- Node.js 18+ and npm
- XAMPP (or any local MySQL server)

## Quick Start

### 1. Install dependencies

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

### 2. Start MySQL and create database

1. Open XAMPP Control Panel
2. Start MySQL (Apache optional)
3. Open phpMyAdmin (usually http://localhost/phpmyadmin)
4. Create database: `pre_enrolment`
5. Import schema: `backend/db/init.sql`

### 3. Configure backend environment

Create `backend/.env` (copy from `backend/.env.example` if available):

```env
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pre_enrolment
CORS_ORIGIN=http://localhost:3000
```

### 4. Run backend API

Backend health endpoint:

http://localhost:4000/api/health

### 5. Run frontend

```bash
npm run dev
```

Frontend:

http://localhost:3000

## Demo Accounts

- student@cihe.edu (pwd: student123)
- sarah@cihe.edu (pwd: student123)
- michael@cihe.edu (pwd: student123)
- emma@cihe.edu (pwd: student123)
- admin@cihe.edu (pwd: admin123)

## Useful Commands

```bash
# Frontend dev server
npm run dev

# Backend dev server
npm run api:dev

# Backend start (non-watch)
npm run api:start
```

## Core Rules Enforced

- Maximum 30 students per class
- Maximum 3 classes per day per student
- Maximum 4 courses per semester per student
- Fixed class times by schedule slots

## Project Structure (Main Folders)

```text
.
├── src/                  # Main React app (current frontend)
├── backend/
│   ├── src/              # Express API server
│   └── db/init.sql       # Database schema/init script
├── api/                  # Legacy PHP endpoints (not primary runtime)
├── config/               # PHP-era config files
└── README.md
```

## Troubleshooting

### Frontend not loading

- Ensure `npm run dev` is running in project root
- If port 3000 is busy, stop old Vite processes and restart

### Login/API errors

- Ensure backend is running at port 4000 (`npm run api:dev`)
- Verify `backend/.env` DB values
- Verify `pre_enrolment` exists and `init.sql` was imported

### Database connection issues

- Confirm MySQL is running
- Check `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`

## Notes

- This repository still contains some legacy PHP files from earlier versions.
- Current primary runtime path is React frontend + Express API + MySQL.

## Version

Version 1.0.0