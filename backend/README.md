# EUROSTRY Backend

Next.js backend service for authentication, property management, inquiries, contact messages, uploads, and admin analytics.

## Run

1. Ensure PostgreSQL is running and `DATABASE_URL` is valid.
2. Run `npm run db:generate`
3. Run `npm run db:migrate`
4. Run `npm run db:seed`
5. Run `npm run backend:dev`

## Production Environment

- `DATABASE_URL`
- `APP_URL`
- `AUTH_COOKIE_NAME`
- `AUTH_COOKIE_DOMAIN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `INQUIRY_NOTIFICATION_EMAIL`
- Optional Cloudinary:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_UPLOAD_PRESET`
  - `CLOUDINARY_FOLDER`

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/[slug]`
- `PATCH /api/properties/[slug]`
- `DELETE /api/properties/[slug]`
- `GET /api/inquiries`
- `POST /api/inquiries`
- `GET /api/contact`
- `POST /api/contact`
- `GET /api/admin/dashboard`
- `POST /api/property-events`
- `POST /api/uploads`
- `GET /api/health`
