# Operio Business Admin

Operio Business Admin is a complete, production-ready, client-centric CRM web application for managing UAE business services. Designed exclusively for a Single Super Admin.

## Tech Stack
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS & Lucide React
- PostgreSQL & Prisma ORM
- Secure Access Key Authentication

## Setup Instructions

Follow these exact steps to run the application:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure PostgreSQL:**
   Ensure you have a running instance of PostgreSQL. Create a database (e.g., `operio_db`).

3. **Create `.env`:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Update the `DATABASE_URL` in `.env` to match your PostgreSQL connection string.

4. **Generate the Access Key hash:**
   Run the secure hash generator:
   ```bash
   node scripts/generate-hash.js
   ```
   Enter your desired private Access Key.

5. **Add the hash to `.env`:**
   Copy the output hash and paste it as `ADMIN_ACCESS_KEY_HASH="..."` in your `.env` file. Also ensure `SESSION_SECRET` is set to a long random string.

6. **Run Prisma migrations:**
   Apply the database schema to your PostgreSQL database:
   ```bash
   npx prisma migrate dev --name init
   ```

7. **Run the seed script:**
   *Note: Seed script is pending Phase 5 completion.*
   ```bash
   npm run seed
   ```

8. **Start the development server:**
   ```bash
   npm run dev
   ```

9. **Open the Access Key login screen:**
   Navigate to [http://localhost:3000/login](http://localhost:3000/login)

10. **Enter the private Access Key:**
    Use the plain text key you generated the hash for in step 4.

11. **Access the Dashboard:**
    You will be securely authenticated and redirected to the operations overview dashboard.

## Production Deployment

When deploying to production:
- Use `npm run build` followed by `npm start`.
- Ensure environment variables are set securely in your hosting platform (Vercel, AWS, etc.).
- Update `STORAGE_PROVIDER` to `s3` and configure bucket credentials for scalable document storage.
