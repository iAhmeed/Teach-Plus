# TEACH PLUS

An administrative web application that manages teaching assignments at the university, calculates teachers' extra hours, and generates corresponding payslips.

---

## Project Description

Teach Plus is a comprehensive educational management system designed for schools and universities to streamline administrative tasks related to teaching schedules, attendance tracking, and payment management. The application provides administrators with tools to manage teachers, create class schedules, track absences, monitor extra hours, and generate payment sheets.

**Key Capabilities:**
- Multi-teacher and multi-period schedule management
- Attendance and absence tracking for teaching sessions
- Automatic calculation of extra hours and payroll integration
- PDF and Excel export functionality for reports and payment sheets
- Secure admin authentication with JWT-based sessions
- Cloud-based image storage for teacher profiles

---

## Features

### 👥 Teacher Management
- Add, edit, and delete teacher profiles
- Upload and manage teacher photos with Cloudinary integration
- Track teacher ranks and position history
- Manage bank account information and contact details
- Categorize teachers by type

### 📅 Schedule & Timetable Management
- Create and manage class sessions (Lectures, Tutorials, Practicals)
- Assign teachers to teaching sessions
- Support for multiple academic levels and groups
- Organize schedules by semester and academic year
- Manage classroom and group assignments

### 📋 Absence Tracking
- Mark and track teacher absences
- Record absence reasons and notes
- View absence history per teacher
- Track catch-up sessions for absences
- Filter absences by academic year and semester

### ⏱️ Extra Hours Management
- Track additional teaching hours beyond normal schedule
- Calculate extra hours with custom rounding methods
- Monitor hours per teacher and academic period
- Integration with payment sheet generation

### 💳 Payment & Sheets Management
- Generate comprehensive payment sheets for teachers
- Calculate total hours with absences impact
- Export payment data to Excel (XLSX format)
- Generate PDF reports and payment summaries
- Support for complex payroll calculations

### 🎓 Academic Management
- Define and manage academic periods
- Create holiday schedules
- Manage teacher ranks and positions
- Organize multi-semester structures
- Track rank history and effective dates

### 📊 Admin Dashboard & Reporting
- View overall teaching statistics and analytics
- Track absence trends and patterns
- Monitor session completion rates
- Generate custom reports
- Visual dashboards with charts and graphs

### 🔐 Security & Administration
- Secure admin login with authentication
- JWT-based session management (7-day expiration)
- Password recovery and reset functionality
- Multi-tenant admin isolation
- Role-based access control

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or later)
- npm package manager
- MySQL database

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/iAhmeed/Teach-Plus
   cd "Teach Plus"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory with the following variables:
   ```
   DATABASE_HOST=your_database_host
   DATABASE_USER=your_database_user
   DATABASE_PASSWORD=your_database_password
   DATABASE_NAME=your_database_name
   DATABASE_PORT=3306

   SESSION_SECRET=your_jwt_secret_key

   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   ABSTRACT_API_KEY=your_abstract_api_key
   ```

4. **Set up the database**
   - Create a MySQL database with the name specified in your environment variables
   - Run database migrations (if available) or import the provided schema

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Database Connection
- Default: Remote MySQL at `freesqldatabase.com`
- Local setup: Update `DATABASE_HOST` to your local MySQL server
- Connection pooling is enabled for performance optimization

---

## Project Structure

```
Teach Plus/
├── src/
│   ├── app/                          # Next.js App Router pages and API routes
│   │   ├── admin/                    # Admin dashboard pages
│   │   │   ├── dashboard/            # Main admin dashboard
│   │   │   ├── teachers/             # Teacher management interface
│   │   │   ├── timetable/            # Schedule creation and editing
│   │   │   ├── extrahours/           # Extra hours tracking and management
│   │   │   └── settings/             # Admin account settings
│   │   │
│   │   ├── api/                      # REST API endpoints (33 routes)
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── teachers/             # Teacher CRUD operations
│   │   │   ├── sessions/             # Class session management
│   │   │   ├── absences/             # Absence tracking endpoints
│   │   │   ├── sheets/               # Payment sheet generation
│   │   │   ├── timetable/            # Schedule data endpoints
│   │   │   ├── periods/              # Academic period endpoints
│   │   │   ├── ranks/                # Teacher rank management
│   │   │   ├── holidays/             # Holiday management
│   │   │   └── statistics/           # Analytics and reporting
│   │   │
│   │   ├── forgotPassword/           # Password recovery page
│   │   ├── reset-password/           # Password reset page
│   │   └── page.js                   # Login page (root)
│   │
│   ├── components/                   # Reusable React components
│   │   ├── absencesList.jsx          # Absence management component
│   │   ├── AddTeacher.jsx            # Add/edit teacher form
│   │   ├── ExtraHoursSheet.jsx       # Extra hours tracking UI
│   │   ├── Periods.jsx               # Academic period manager
│   │   ├── Ranks.jsx                 # Rank/position manager
│   │   ├── Holidays.jsx              # Holiday management
│   │   ├── Schedule.jsx              # Schedule display component
│   │   ├── ProfilTeacher.jsx         # Teacher profile view
│   │   └── [16+ other components]    # Additional UI components
│   │
│   ├── store/                        # State management (Zustand)
│   │   └── useStore.js               # Central state store for app-wide state
│   │
│   ├── lib/                          # Utility functions and helpers
│   │   ├── mysql.js                  # MySQL connection pool
│   │   ├── calculate.js              # Hour calculation utilities
│   │   └── cloudinary.js             # Cloudinary integration
│   │
│   ├── images/                       # Static image assets
│   │   └── [Application logos and images]
│   │
│   └── middleware.js                 # JWT authentication middleware
│
├── public/                           # Public static assets
│
├── Configuration Files
│   ├── next.config.mjs               # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS customization
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── jsconfig.json                 # JavaScript path aliases
│   ├── eslint.config.mjs             # ESLint rules
│   └── package.json                  # Project dependencies and scripts
│
├── .env                              # Environment variables (production)
├── .env.local                        # Environment variables (local development)
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

### Key Directories Explained

- **`src/app/`** - Next.js application root containing pages and API routes following the App Router pattern
- **`src/components/`** - Reusable React components for the UI (forms, tables, dialogs, etc.)
- **`src/store/`** - Zustand state management for global application state
- **`src/lib/`** - Utility functions for database operations, calculations, and external integrations
- **`src/images/`** - Static assets used throughout the application

### Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend Framework** | Next.js | 15.2.4 |
| **UI Library** | React | 19.1.0 |
| **Styling** | Tailwind CSS | 4.1.7 |
| **State Management** | Zustand | 5.0.3 |
| **Database** | MySQL | 2 (Node.js driver) |
| **Authentication** | JWT (Jose) | 6.0.10 |
| **Export Formats** | jsPDF, XLSX | 3.0.1, 0.18.5 |
| **Cloud Storage** | Cloudinary | 2.6.0 |
| **Charts** | Recharts | 2.15.3 |
| **Tables** | TanStack React Table | 8.21.2 |
