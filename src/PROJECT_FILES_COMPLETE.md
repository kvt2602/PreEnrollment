# CIHE Pre-Enrolment System - Complete Project Files

## Project Structure

```
/
├── App.tsx                          # Main application entry point
├── styles/
│   └── globals.css                  # Global styles and Tailwind configuration
├── components/
│   ├── LoginPage.tsx                # Login and registration page
│   ├── StudentDashboard.tsx         # Student dashboard with course selection
│   ├── AdminDashboard.tsx           # Admin dashboard with approval and reports
│   ├── DashboardHeader.tsx          # Shared header component
│   ├── DetailedReportsTab.tsx       # Two report types component
│   └── ui/                          # UI component library (shadcn/ui)
├── utils/
│   └── mockApi.ts                   # Mock API for local storage operations
└── package.json                     # Project dependencies
```

## Key Features

### Student Flow
- Login/Registration with demo accounts
- Course selection with unit codes
- Day preference (Monday-Friday)
- Time preference (Morning 8-12, Evening 2-6)
- Real-time status tracking (Pending/Approved/Rejected)
- Dashboard statistics

### Admin Flow
- View all student preferences
- Approve/Reject course preferences
- Two report types:
  1. **Students Enrolled in Same Course** - Lists all students per course
  2. **Students Enrolled in Same Two Courses** - Shows course pair combinations
- Overlap analysis for scheduling conflicts
- CSV export with comprehensive data

### Technical Stack
- React + TypeScript
- Tailwind CSS v4
- shadcn/ui components
- LocalStorage for data persistence
- Recharts for data visualization
- Lucide React for icons

## Demo Accounts

### Students
- student@cihe.edu / student123 (CIHE231554)
- sarah@cihe.edu / student123 (CIHE231555)
- michael@cihe.edu / student123 (CIHE231556)
- emma@cihe.edu / student123 (CIHE231557)

### Admin
- admin@cihe.edu / admin123

## Pre-populated Courses

1. CS101 - Introduction to Computer Science
2. BUS201 - Business Management Fundamentals
3. ENG301 - Software Engineering Principles
4. DATA202 - Data Structures and Algorithms
5. WEB303 - Web Development
6. AI401 - Artificial Intelligence
7. DB205 - Database Systems
8. NET304 - Computer Networks

## Installation Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Steps

1. **Create a new React + TypeScript project**
```bash
npm create vite@latest cihe-enrollment -- --template react-ts
cd cihe-enrollment
```

2. **Install dependencies**
```bash
npm install
npm install recharts lucide-react sonner@2.0.3
npm install -D tailwindcss@next @tailwindcss/vite@next
```

3. **Copy all project files**
   - Copy `App.tsx` to `src/App.tsx`
   - Copy all files from `components/` to `src/components/`
   - Copy all files from `utils/` to `src/utils/`
   - Copy `styles/globals.css` to `src/styles/globals.css`

4. **Configure Vite**

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

5. **Update main.tsx**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

6. **Run the application**
```bash
npm run dev
```

7. **Access the application**
   - Open browser to `http://localhost:5173`
   - Login with demo accounts

## Data Storage

The system uses browser LocalStorage with three keys:
- `cihe_users` - User accounts
- `cihe_courses` - Course catalog
- `cihe_preferences` - Student course preferences

Data persists across browser sessions. Use "Reset Data to Demo Defaults" button to restore demo data.

## Report Types Details

### Report Type 1: Students Enrolled in Same Course
- Groups students by individual courses
- Shows all students regardless of time/day preference
- Displays student names, CIHE IDs, emails
- Shows day/time preferences and approval status
- Provides statistics: total, approved, pending, rejected

### Report Type 2: Students Enrolled in Same Two Courses
- Identifies course pair combinations
- Shows students taking both courses in each pair
- Displays preferences for both courses side-by-side
- Helps identify popular course combinations
- Useful for coordinating course schedules

### CSV Export Features
Both report types are included in the CSV download with:
- Student names and CIHE IDs
- Course details and preferences
- Status information
- Summary statistics
- Organized sections for easy reading

## Key Components Documentation

### App.tsx
Main application component that:
- Manages user authentication state
- Routes between LoginPage, StudentDashboard, and AdminDashboard
- Persists user session in localStorage

### LoginPage.tsx
Authentication component with:
- Login and registration forms
- Demo account information display
- Data reset functionality
- Local storage mode indicator

### StudentDashboard.tsx
Student interface with:
- Course preference submission dialog
- My preferences list with status tracking
- Real-time status updates
- Notification system for pending approvals

### AdminDashboard.tsx
Administrator interface with:
- Student preferences management table
- Approve/reject functionality
- Three tabs: Preferences, Reports, Overlap Analysis
- CSV report generation
- Statistics cards

### DetailedReportsTab.tsx
Two specialized reports:
- Report Type 1: Same Course enrollment
- Report Type 2: Same Two Courses enrollment
- Visual cards with student details
- Status badges and statistics
- Alert notifications for high enrollment

### mockApi.ts
Data management layer:
- User authentication (login/register)
- Course catalog management
- Preference CRUD operations
- Statistics calculation
- Overlap analysis algorithms
- Demo data initialization

## Customization Guide

### Adding New Courses
Edit the `initializeDemoData` function in `/utils/mockApi.ts`:

```typescript
const courses: Course[] = [
  { id: 'NEWCODE', name: 'New Course Name', unitCode: 'NEWCODE' },
  // ... existing courses
];
```

### Adding More Demo Users
Edit the users array in `initializeDemoData`:

```typescript
const users: User[] = [
  {
    email: 'newuser@cihe.edu',
    password: 'password123',
    name: 'New User Name',
    role: 'student',
    ciheId: 'CIHE999999',
  },
  // ... existing users
];
```

### Modifying Time Slots
Update the time options in:
- StudentDashboard.tsx (selection dropdown)
- DetailedReportsTab.tsx (display logic)
- AdminDashboard.tsx (report generation)

### Changing UI Colors
Edit the Tailwind color classes in components or modify CSS variables in `styles/globals.css`.

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations
- Data stored only in browser localStorage
- No backend database
- No email notifications
- No file upload for bulk operations
- Single browser/device (data not synced)

## Future Enhancements (Optional)
- Supabase integration for cloud storage
- Real-time notifications
- Email integration
- PDF report generation
- Bulk import/export features
- Mobile app version
- Calendar integration
- Room/resource allocation

## Support Information
This is a complete, standalone application that runs entirely in the browser. No server setup required!

## License
Educational project - Free to use and modify
