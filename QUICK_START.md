# Quick Start Guide

## What Was Done

✅ **Password System** - Users now need passwords to register and login
✅ **Trainer Accounts** - 4 trainers created with login credentials
✅ **PT Booking** - "Rezerviraj trenerja" button now works properly
✅ **Home Page** - Added descriptive text and fixed all buttons
✅ **Security** - Passwords are hashed with bcryptjs

## Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Update database
npm run db:migrate

# 4. Create test users
npm run db:seed

# 5. Start server
npm run dev
```

## Test Accounts

### Member (Regular User)

```
Email: clan@example.com
Password: demo123
```

### Trainer (Admin)

```
Email: trener@example.com
Password: trener123
```

### Other Trainers

- trener1@example.com / maja123
- trener2@example.com / luka123
- trener3@example.com / eva123

## What Changed

### Registration Page (`/registracija`)

- Now has password field
- Password must be at least 6 characters
- Password is hashed before saving

### Login Page (`/prijava`)

- Password is required
- Password is verified against database
- Shows error if credentials are wrong

### Home Page (`/`)

- Added description text in "Plan paketa" section
- "Izberi paket" button links to registration
- "Poglej urnik" button links to schedule

### PT Booking (`/rezervacija-trenerja`)

- "Rezerviraj" button now works
- Shows error if not logged in
- Shows success message after booking

## Test It

1. **Register new user**

   - Go to `/registracija`
   - Fill in all fields with a password (min 6 chars)
   - Click "Ustvari račun"

2. **Login**

   - Go to `/prijava`
   - Use clan@example.com / demo123
   - Should redirect to profile

3. **Book trainer**

   - Login as demo user
   - Go to `/rezervacija-trenerja`
   - Select trainer and time
   - Click "Rezerviraj"
   - Should see success message

4. **Trainer login**
   - Go to `/prijava`
   - Use trener@example.com / trener123
   - Should see admin dashboard

## Files to Check

- `AUTHENTICATION_SETUP.md` - Detailed auth documentation
- `CHANGES_SUMMARY.md` - Complete list of changes
- `app/api/register/route.ts` - Registration logic
- `app/api/login/route.ts` - Login logic
- `prisma/schema.prisma` - Database schema with password field

## Troubleshooting

**"Cannot find module 'bcryptjs'"**

- Run `npm install`

**"Password field not found"**

- Run `npm run prisma:generate`
- Run `npm run db:migrate`

**Login not working**

- Make sure you ran `npm run db:seed`
- Check database has password column
- Try with correct credentials from above

## Key Features

✅ Passwords hashed with bcryptjs (not plain text)
✅ HTTP-only secure cookies
✅ Password validation (min 6 chars)
✅ Trainer accounts with different permissions
✅ PT booking requires login
✅ All buttons on home page are functional
✅ Descriptive text on packages section

## Next Steps

- Test all functionality
- Verify trainer can access admin dashboard
- Check PT booking works
- Confirm buttons navigate correctly

---

**Questions?** Check the documentation files or the code comments.
