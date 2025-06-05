# School Portal (Polypad) Technical Documentation

## Overview
This document explains how to set up, run, and use the School Portal (Polypad) codebase for local development and production. It covers environment setup, database configuration, running the app, and basic usage for both students and teachers.

---

## Prerequisites
- **Node.js** (v18 or later recommended)
- **npm** (v9 or later)
- **PostgreSQL** (local or cloud instance)
- **Git**

---

## 1. Clone the Repository
```bash
git clone https://github.com/yourusername/polypad.git
cd polypad
```

---

## 2. Install Dependencies
```bash
npm install
```

---

## 3. Configure Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
```
- Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your PostgreSQL credentials.
- Get Google and OpenAI API keys from their respective developer portals.

---

## 4. Set Up the Database
- **Run Prisma migrations:**
```bash
npx prisma migrate dev --name init
```
- **(Optional) Open Prisma Studio to inspect data:**
```bash
npx prisma studio
```

---

## 5. Seed the Database (Optional)
If you have a seed script, run:
```bash
npm run seed
```
This will create initial admin, teacher, and student accounts for testing.

---

## 6. Run the App Locally
```bash
npm run dev
```
- The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 7. Build for Production
```bash
npm run build
npm start
```

---

## 8. Development Workflow
- **API routes:** Located in `app/api/`
- **Frontend pages:** Located in `app/student/` and `app/teacher/`
- **Components:** Located in `app/components/`
- **Database schema:** See `prisma/schema.prisma` and [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Environment variables:** Managed in `.env.local`

---

## 9. User Roles & Usage

### Students
- Register or log in using email/password or Google.
- Join cohorts (teachers can add students to cohorts).
- Use the Polypad workspace to create and save work.
- View and manage your saved work.

### Teachers
- Register or log in using email/password or Google.
- Create and manage cohorts.
- Add or remove students from cohorts.
- View student submissions by cohort and student.
- Provide feedback and monitor progress.

### Admins
- Approve or reject pending teacher accounts.
- Manage users and cohorts (future features).

---

## 10. Troubleshooting
- **Database connection errors:** Check your `DATABASE_URL` and that PostgreSQL is running.
- **Prisma errors:** Run `npx prisma generate` and `npx prisma migrate dev` to ensure schema is up to date.
- **Authentication issues:** Ensure all environment variables are set and valid.
- **Missing data:** Use Prisma Studio to inspect and edit data directly.

---

## 11. Useful Commands
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npx prisma migrate dev` — Run migrations
- `npx prisma studio` — Open database GUI
- `npm run seed` — Seed the database (if script exists)

---

## 12. Further Reading
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Database schema and relationships
- [README.md](./README.md) — Project overview and features
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)

---

For questions or support, open an issue or contact the maintainer. 