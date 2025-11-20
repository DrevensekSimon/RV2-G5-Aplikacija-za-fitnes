# Role-Based System - Quick Reference Guide

## How It Works

The application now supports two user roles:

### 1. **Regular User** (user)

When a user logs in with a regular user role, they see:

- **Navigation**: Urnik, Beljakovinski kalkulator, Moj profil
- **Features**:
  - View group classes schedule
  - Book group classes
  - Use protein calculator
  - View personal profile

### 2. **Admin/Trainer** (admin or trainer)

When an admin/trainer logs in, they see:

- **Navigation**: Nadzorna plošča, Nadzorna plošča (members), Zahteve
- **Features**:
  - Admin dashboard with statistics
  - Members management
  - Group classes management
  - Recent activity tracking

## Pages & Routes

### User Routes

- `/` - Home page (visible to all)
- `/urnik-tedenski` - Weekly schedule
- `/beljakovinski-kalkulator` - Protein calculator
- `/moj-profil` - User profile
- `/prijava` - Login page
- `/registracija` - Registration page

### Admin Routes (Protected)

- `/nadzorna-plosca` - Admin dashboard with statistics
- `/nadzorna-plosca/stranke` - Members overview
- `/nadzorna-plosca/skupinske-vadbe` - Group classes management

## API Endpoints (Protected - Admin Only)

All admin API endpoints require authentication and admin role:

- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/members` - Get all members list
- `GET /api/admin/group-classes` - Get group classes list

## Database Role Setup

The system uses the existing `Role` table in the database. Make sure your database has:

```sql
INSERT INTO roles (name) VALUES ('user');
INSERT INTO roles (name) VALUES ('admin');
INSERT INTO roles (name) VALUES ('trainer');
```

Users with role_id pointing to 'admin' or 'trainer' will be treated as admins.

## Protein Calculator

The protein calculator uses a custom formula based on:

- **Body weight** (kg)
- **Age** (years)
- **Gender** (male/female)
- **Activity level** (low, moderate, high, athlete)
- **Goal** (weight loss, maintenance, muscle gain)

### Formula Factors:

- **Goal Factor**: 1.4 (maintenance), 1.6 (weight loss), 2.0 (muscle gain)
- **Activity Factor**: 0 (low), 0.2 (moderate), 0.4 (high), 0.6 (athlete)
- **Gender Factor**: 0.1 (male), 0 (female)
- **Age Factor**: 0 (under 30), 0.1 (30-50), 0.2 (over 50)

**Final Calculation**: `protein (g) = weight (kg) × (goal_factor + activity_factor + gender_factor + age_factor)`

## Authentication Flow

1. User logs in via `/prijava`
2. Credentials are verified
3. User ID is stored in a cookie (`uid`)
4. On each page load, the layout checks:
   - If user is logged in (uid cookie exists)
   - What role the user has
   - Shows appropriate navigation

## Security

- Admin routes are protected by middleware
- Unauthenticated users trying to access admin pages are redirected to login
- API endpoints verify admin role before returning data
- All role checks happen server-side

## File Structure

```
app/
├── nadzorna-plosca/              # Admin dashboard
│   ├── page.tsx                  # Main dashboard
│   ├── stranke/
│   │   └── page.tsx              # Members page
│   └── skupinske-vadbe/
│       └── page.tsx              # Group classes page
├── api/
│   └── admin/                    # Protected admin endpoints
│       ├── dashboard-stats/
│       ├── members/
│       └── group-classes/
├── beljakovinski-kalkulator/
│   └── page.tsx                  # Protein calculator page
└── layout.tsx                    # Updated with role-based nav

components/
└── BeljakovinskiKalkulator.tsx    # Protein calculator component

lib/
├── auth.ts                       # Authentication utilities
└── prisma.ts                     # Prisma client

middleware.ts                     # Route protection
```

## Testing the System

### Test as Regular User:

1. Register/login with a user account
2. You should see: Urnik, Beljakovinski kalkulator, Moj profil
3. Trying to access `/nadzorna-plosca` should redirect to login

### Test as Admin:

1. Make sure your user has role_id pointing to admin/trainer role
2. Login with admin account
3. You should see: Nadzorna plošča, Nadzorna plošča, Zahteve
4. You can access all admin pages and see statistics

## Customization

### Change Navigation Labels

Edit `app/layout.tsx` - Update the Link text and href values

### Modify Dashboard Stats

Edit `app/api/admin/dashboard-stats/route.ts` - Adjust queries and calculations

### Update Protein Calculator Formula

Edit `components/BeljakovinskiKalkulator.tsx` - Modify the factor calculations

### Add New Admin Pages

1. Create new folder in `app/nadzorna-plosca/`
2. Add `page.tsx` file
3. Add corresponding API endpoint in `app/api/admin/`
4. Update navigation in `app/layout.tsx`
