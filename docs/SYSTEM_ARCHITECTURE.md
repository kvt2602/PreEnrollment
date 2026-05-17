# CIHE Pre-Enrolment System Architecture

This document explains the main architecture of the CIHE Pre-Enrolment System.
The current primary runtime uses a React frontend, a Node.js/Express backend,
and a MySQL database. Some PHP files remain in the repository as legacy or
testing utilities.

## High-Level Architecture

```mermaid
flowchart TD
    User["Student / Admin User"]

    subgraph Frontend["Frontend Layer - React + Vite"]
        UI["User Interface"]
        Login["Login / Register Page"]
        StudentDash["Student Dashboard"]
        AdminDash["Admin Dashboard"]
        ApiClient["API Client - src/utils/mockApi.ts"]
        LocalStorage["Browser localStorage - cihe_user"]
    end

    subgraph Backend["Backend Layer - Node.js + Express"]
        Server["Express Server - backend/src/server.js"]
        Security["Security Middleware - CORS + Helmet"]
        Auth["Authentication Module"]
        CourseAPI["Course / Unit API"]
        PreferenceAPI["Preference / Enrolment Preference API"]
        ReportsAPI["Reports API"]
        OverlapAPI["Overlap Analysis API"]
        SeedAPI["Demo Data Seed API"]
        Mailer["Email Notification Service - Nodemailer"]
    end

    subgraph Database["Database Layer - MySQL"]
        DB[("pre_enrolment Database")]
        Users["users table"]
        Courses["courses table"]
        Preferences["preferences table"]
    end

    subgraph Legacy["Legacy / Testing Utilities"]
        PHP["Legacy PHP endpoints - api/*.php"]
        TestLogin["test_login.php"]
        IndexPHP["index.php"]
    end

    User --> UI
    UI --> Login
    UI --> StudentDash
    UI --> AdminDash

    Login --> ApiClient
    StudentDash --> ApiClient
    AdminDash --> ApiClient

    Login --> LocalStorage
    StudentDash --> LocalStorage
    AdminDash --> LocalStorage

    ApiClient -->|"REST API requests"| Server

    Server --> Security
    Server --> Auth
    Server --> CourseAPI
    Server --> PreferenceAPI
    Server --> ReportsAPI
    Server --> OverlapAPI
    Server --> SeedAPI

    Auth --> DB
    CourseAPI --> DB
    PreferenceAPI --> DB
    ReportsAPI --> DB
    OverlapAPI --> DB
    SeedAPI --> DB

    PreferenceAPI --> Mailer

    DB --> Users
    DB --> Courses
    DB --> Preferences

    Preferences --> Users
    Preferences --> Courses

    PHP -.-> DB
    TestLogin -.-> PHP
    IndexPHP -.-> PHP
```

## Main Components

- Frontend: React and Vite provide the student and admin user interfaces.
- API client: `src/utils/mockApi.ts` sends REST requests to the backend.
- Backend: `backend/src/server.js` handles authentication, courses,
  preferences, reports, overlap analysis, and demo data seeding.
- Database: MySQL stores users, courses, and student preference submissions.
- Email service: Nodemailer can notify students when preferences are approved
  or rejected.

## Main Data Flow

```mermaid
sequenceDiagram
    participant User as Student/Admin
    participant Frontend as React Frontend
    participant API as Express API
    participant DB as MySQL Database

    User->>Frontend: Login or submit preference
    Frontend->>API: Send REST API request
    API->>DB: Validate, read, or save data
    DB-->>API: Return query result
    API-->>Frontend: Return JSON response
    Frontend-->>User: Show dashboard update
```

## Short Explanation

The system follows a three-layer architecture. The React frontend handles the
screens for students and admins. The Express backend handles business logic and
connects to MySQL. The database stores user accounts, available units, and
student pre-enrolment preferences. Admin reporting and overlap analysis use the
stored preference data to help with timetable planning.
