# Academic Dashboard

A comprehensive local academic dashboard for tracking student progress, assignments, tests, attendance, and more. Built for 3-4 users with basic authentication.

## Deployment

### 🚀 Deploy to Glitch (Recommended - No Credit Card!)

**Easiest deployment option** - free, no credit card required!

See [DEPLOY_GLITCH.md](DEPLOY_GLITCH.md) for complete instructions.

**Quick Start:**
1. Go to https://glitch.com (sign up with GitHub)
2. Create "New Project" → "Import from GitHub"
3. Enter: `https://github.com/ajaymathew1/SchoolDashboard`
4. Wait 5 minutes - done! 🎉

**Your live app**: `https://your-project-name.glitch.me`

### Alternative: Render

See [DEPLOYMENT.md](DEPLOYMENT.md) for Render deployment (requires credit card verification).

## Technologies Used

### Backend
- **Runtime**: Node.js with Express
- **Database**: SQLite (local file-based)
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful endpoints

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Charts**Human: (visualization library)
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation & Setup

### 1. Clone/Navigate to Project

```bash
cd /home/yoda/Developer/AIProjects/SchoolDashboard
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Initialize database (creates tables and default admin user)
npm run init-db

# Start the server
npm start
```

The backend will run on `http://localhost:3000`

**Default Admin Credentials:**
- Email: `admin@dashboard.local`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the default password after first login!

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Login with the default admin credentials
3. Start adding subjects, assignments, tests, and other data

## Project Structure

```
SchoolDashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration & schema
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Auth middleware
│   │   └── ...
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env                # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── context/        # React context (Auth)
    │   ├── services/       # API service layer
    │   └── ...
    ├── package.json
    └── vite.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/deadlines` - Get upcoming deadlines
- `GET /api/dashboard/alerts` - Get alerts and reminders

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create subject
- `GET /api/subjects/:id` - Get subject details
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Tests
- `GET /api/tests` - List tests
- `GET /api/tests/analytics` - Get test analytics
- `POST /api/tests` - Create test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Attendance
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/summary` - Get attendance summary
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Fees
- `GET /api/fees` - List fees
- `GET /api/fees/summary` - Get fees summary
- `POST /api/fees` - Create fee (admin only)
- `PUT /api/fees/:id` - Update fee (admin only)
- `DELETE /api/fees/:id` - Delete fee (admin only)

### Additional Modules
- Events: `/api/events`
- Awards: `/api/awards`
- Activities: `/api/activities`
- Notes: `/api/notes`

## Features

### Priority 1 (Implemented)
- ✅ User authentication
- ✅ Subject management with topics
- ✅ Assignment tracking
- ✅ Test results & analytics
- ✅ Attendance calendar
- ✅ Fee management
- ✅ Events timeline
- ✅ Awards & certificates
- ✅ External activities logging
- ✅ Notes & communications
- ✅ Dashboard with statistics

### Database Schema
The complete database schema includes tables for:
- Users
- Subjects & Topics
- Books & Resources
- Facilitators
- Assignments
- Tests
- Attendance
- Fees
- Events
- Awards
- Activities
- Notes & Communications
- Activity Logs

## Development Notes

- The database file (`database.sqlite`) will be created in the backend directory on first initialization
- JWT tokens expire in 7 days by default (configurable in `.env`)
- CORS is enabled for frontend-backend communication
- All API routes (except auth) require authentication

## Troubleshooting

### Backend Issues

**Issue**: better-sqlite3 installation fails
- Make sure you're using Node.js v18 or higher
- Try: `npm install better-sqlite3@11.0.0` explicitly

**Issue**: Database not initializing
- Run: `npm run init-db` manually
- Check backend/database.sqlite is created

### Frontend Issues

**Issue**: API calls failing
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify the API_BASE_URL in `src/services/api.js`

**Issue**: Login not working
- Verify backend database is initialized
- Check default credentials are correct
- Clear browser storage and try again

## Security Notes

- This is designed for **local use only**, not for production deployment
- Change the default JWT_SECRET in `.env` for production use
- Always change the default admin password
- Database is stored locally with no cloud sync

## Future Enhancements

- File upload for certificates, assignments, etc.
- Rich text editor for notes
- Calendar integration
- Export reports to PDF
- Data backup/restore functionality
- Multiple user profiles with detailed permissions
- Mobile responsive design improvements

## License

This project is for personal/educational use.
