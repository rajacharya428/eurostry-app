# EUROSTRY Launch Guide

This project is now set up for:
- Frontend on Vercel
- Backend on Vercel
- PostgreSQL on Neon

Neon is the recommended Postgres host here because it fits the Vercel workflow well and is the current Vercel Marketplace path for Postgres.

## 1. Create the Neon Database

1. Create a Neon account.
2. Create a new project named `eurostry-production`.
3. Copy the connection string.
4. Replace the password placeholder with the real Neon password.

Use that value for:
- frontend project `DATABASE_URL`
- backend project `DATABASE_URL`

## 2. Create the Vercel Frontend Project

Create a new Vercel project from this repo with:
- Root Directory: repository root
- Framework Preset: Vite

The project already includes:
- `vercel.json` for SPA routing

Set these environment variables in the frontend Vercel project:

- `VITE_API_BASE_URL=https://YOUR-BACKEND-PROJECT.vercel.app`
- `VITE_SITE_URL=https://YOUR-FRONTEND-PROJECT.vercel.app`
- `DATABASE_URL=YOUR_NEON_CONNECTION_STRING`
- `SMTP_HOST=YOUR_SMTP_HOST`
- `SMTP_PORT=YOUR_SMTP_PORT`
- `SMTP_USER=contact@eurostrygroup.com`
- `SMTP_PASS=YOUR_SMTP_PASSWORD`
- `SMTP_FROM_EMAIL=contact@eurostrygroup.com`
- `INQUIRY_NOTIFICATION_EMAIL=contact@eurostrygroup.com`
- Optional Cloudinary:
  - `CLOUDINARY_CLOUD_NAME=...`
  - `CLOUDINARY_UPLOAD_PRESET=...`
  - `CLOUDINARY_FOLDER=eurostry`

## 3. Create the Vercel Backend Project

Create another Vercel project from the same repo with:
- Root Directory: `backend`
- Framework Preset: Next.js

The backend directory now includes its own `package.json` so Vercel can build it as a separate project.

Set these environment variables in the backend Vercel project:

- `DATABASE_URL=YOUR_NEON_CONNECTION_STRING`
- `APP_URL=https://YOUR-BACKEND-PROJECT.vercel.app`
- `AUTH_COOKIE_NAME=eurostry_session`
- `AUTH_COOKIE_DOMAIN=`
- `JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET`
- `SMTP_HOST=YOUR_SMTP_HOST`
- `SMTP_PORT=YOUR_SMTP_PORT`
- `SMTP_USER=contact@eurostrygroup.com`
- `SMTP_PASS=YOUR_SMTP_PASSWORD`
- `SMTP_FROM_EMAIL=contact@eurostrygroup.com`
- `INQUIRY_NOTIFICATION_EMAIL=contact@eurostrygroup.com`
- Optional Cloudinary:
  - `CLOUDINARY_CLOUD_NAME=...`
  - `CLOUDINARY_UPLOAD_PRESET=...`
  - `CLOUDINARY_FOLDER=eurostry`

## 4. Run Production Prisma Migrations

You need to run this once against Neon before opening the site:

```bash
npx prisma migrate deploy
npm run db:seed
```

Run those commands from the repository root with the production `DATABASE_URL` loaded in your shell.

PowerShell example:

```powershell
$env:DATABASE_URL="YOUR_NEON_CONNECTION_STRING"
npx prisma migrate deploy
npm run db:seed
```

## 5. Update Final Domain Values

Before launch, replace these if your final domain is not `https://www.eurostry.com`:
- `public/robots.txt`
- `public/sitemap.xml`

Also update:
- `VITE_SITE_URL`
- `APP_URL`
- `VITE_API_BASE_URL`

## 6. Final Live Test

Check these on the live URLs:

1. Home page loads
2. Apartment search page loads
3. Register works
4. Admin login redirects to `/admin`
5. Apartment creation works
6. Image upload works
7. Apartment contact form works
8. Booking request works
9. Email reaches `contact@eurostrygroup.com`
10. Admin dashboard updates with new leads and activity

## What You Still Need To Do Yourself

- Create the Neon project
- Create both Vercel projects
- Add the environment variables in Vercel
- Run the production migration commands with the real Neon connection string
- Add your real SMTP provider credentials
- Optional: create Cloudinary and add its values
