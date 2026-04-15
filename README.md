# EUROSTRY

EUROSTRY is a React + Vite frontend with a Next.js backend and PostgreSQL database for apartment listings, owner workflows, inquiries, contact messages, and an internal admin dashboard.

## Local Development

1. Install dependencies:
   `npm install`
2. Make sure PostgreSQL is running.
3. Copy env values from `.env.example` and `backend/.env.example`.
4. Generate Prisma client:
   `npm run db:generate`
5. Apply the database schema:
   `npm run db:migrate`
6. Seed sample data:
   `npm run db:seed`
7. Start frontend and backend together:
   `npm run dev:full`

Frontend:
- `http://127.0.0.1:5173`

Backend:
- `http://localhost:3000`

## Main Features

- One-page marketing homepage with featured apartments
- Dedicated apartment search page with filters
- Property-specific contact and booking request flows
- Owner page and contact page
- Admin dashboard with analytics, inventory management, inquiries, and activity feed
- PostgreSQL + Prisma data model for users, sessions, properties, inquiries, and events

## Production Checklist

### Required before launch

- Set a real production `DATABASE_URL`
- Set `VITE_SITE_URL` to your final frontend domain
- Set `APP_URL` to your final backend or site URL
- Configure SMTP:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM_EMAIL`
  - `INQUIRY_NOTIFICATION_EMAIL`
- Configure cookie settings:
  - `AUTH_COOKIE_NAME`
  - `AUTH_COOKIE_DOMAIN` if needed for your domain setup

### Recommended before launch

- Configure Cloudinary so uploaded apartment photos are stored off-server:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_UPLOAD_PRESET`
  - `CLOUDINARY_FOLDER`
- Update legal copy on:
  - `/privacy`
  - `/terms`
  - `/cookies`
- Update `public/sitemap.xml` and `public/robots.txt` if your final domain is not `https://www.eurostry.com`
- Verify all emails, contact forms, and inquiry flows on the live domain
- Add backups and database monitoring on your production Postgres provider

## Recommended Hosting

- Frontend: Vercel
- Backend: Vercel
- Postgres: Neon

Detailed deployment steps:
- `docs/DEPLOY_VERCEL_NEON.md`

## Deployment Notes

- The frontend uses `BrowserRouter`, so your frontend host must rewrite unknown routes to `index.html`
- The backend should run with the same environment variables used in local development, but with production secrets
- Run Prisma migrations against production before opening the site publicly:
  `npx prisma migrate deploy`

## Seed Accounts

- Admin: `admin@eurostry.com` / `Eurostry1234`
- Owner: `owner@eurostry.com` / `Eurostry1234`
- Tenant: `tenant@eurostry.com` / `Eurostry1234`
