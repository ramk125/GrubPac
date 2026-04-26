# Content Broadcasting System - Backend

## Introduction
The Content Broadcasting System is a robust Express backend designed to schedule and rotate educational content (such as quiz questions and assignments) dynamically, directly onto student devices based on subject groupings. It employs an advanced rotation algorithm calculating time boundaries purely at endpoints on-demand.

## Tech Stack
- **Node.js & Express.js**: High-performance routing framework.
- **Prisma & SQLite**: Fully typed ORM mapped to a local SQLite instance for zero-configuration testing. Can be immediately swapped to PostgreSQL by updating `prisma/schema.prisma`.
- **JWT & bcryptjs**: Deep role-based access management.
- **Multer**: Strict local multipart/form-data upload management.

## Setup Instructions
1. Clone the repository natively.
2. Ensure you have Node.js 18+ installed.
3. Install the node packages:
   ```bash
   npm install
   ```
4. Run the database migration to hydrate the SQLite engine:
   ```bash
   npx prisma migrate dev
   ```
5. Run the application:
   ```bash
   npm run dev
   # Server spawns on http://localhost:3000
   ```

## Assumptions & Missing Elements
1. Due to strict real-world testing environments, I decided to supply the local codebase using SQLite so reviewers do not need to configure an obscure `.env` or run a local PostgreSQL docker instance, as everything evaluates precisely the same logic paths through Prisma. 
2. Because the `/live` schedule evaluates the exact `start_time` and `end_time`, a teacher MUST supply valid timing constraints, otherwise the content inherently will not be evaluated as "active." Default duration is 5 minutes for rotations if not explicitly requested by the teacher.

## API Usage Flow

**Auth**
- `POST /api/auth/register` (Pass `role`: `PRINCIPAL` or `TEACHER`)
- `POST /api/auth/login`

**Teacher**
- `POST /api/teacher/content`
  - Headers: `Authorization: Bearer <TOKEN>`
  - Body: `multipart/form-data` containing `title`, `subject`, `file` (image), and importantly: `start_time` & `end_time` logic parameters.

**Principal**
- `GET /api/principal/content/pending`
- `PATCH /api/principal/content/:id/approve`
- `PATCH /api/principal/content/:id/reject` -> Must pass `{ "rejection_reason": "..." }`

**Public Broadcast API**
- `GET /api/content/live/:teacher_id`
  - Returns the calculated array of broadcasting elements for the designated teacher across multiple subjects. Filter string can be conditionally added: `?subject=Maths`.
