# School Portal Database Schema (PostgreSQL/Prisma)

## Database: PostgreSQL (Prisma ORM)

### Models

#### User
```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  name          String
  password      String?
  role          String   // 'student', 'teacher', or 'admin'
  emailVerified Boolean  @default(false)
  image         String?
  status        String   @default("active") // 'active', 'pending', 'rejected'
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  approvedBy    String?
  approvedAt    DateTime?
  rejectedBy    String?
  rejectedAt    DateTime?
  provider      String?  // 'credentials' or 'google'

  // Relations
  savedWork     SavedWork[]
  cohorts       Cohort[]    @relation("CohortStudents")
  teachingCohorts Cohort[]  @relation("CohortTeacher")
}
```

#### Cohort
```prisma
model Cohort {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  students  User[]   @relation("CohortStudents")
  teacher   User?    @relation("CohortTeacher", fields: [teacherId], references: [id])
  teacherId Int?
  work      SavedWork[]
}
```

#### SavedWork
```prisma
model SavedWork {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  screenshot  String   // Base64 encoded image
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  student     User     @relation(fields: [studentId], references: [id])
  studentId   Int
  cohort      Cohort?  @relation(fields: [cohortId], references: [id])
  cohortId    Int?
}
```

#### PendingTeacher
```prisma
model PendingTeacher {
  id                Int      @id @default(autoincrement())
  email            String   @unique
  name             String
  password         String
  role             String   @default("teacher")
  status           String   @default("pending")
  createdAt        DateTime @default(now())
  verificationToken String   @unique
}
```

### Indexes
- User: `email` (unique)
- PendingTeacher: `email` (unique), `verificationToken` (unique)
- Cohort: `id` (primary key)
- SavedWork: `id` (primary key)

### Relationships
- **User–Cohort (Many-to-Many):** Students can be in multiple cohorts, cohorts can have multiple students.
- **User–Cohort (One-to-Many):** A teacher can teach multiple cohorts.
- **Cohort–SavedWork (One-to-Many):** Each cohort can have multiple saved work entries.
- **User–SavedWork (One-to-Many):** Each student can have multiple saved work entries.

### Security & Validation
- Passwords are hashed using bcrypt.
- Email must be unique for users and pending teachers.
- Role-based access control (RBAC) enforced in API and middleware.
- Data validation for required fields and correct types.

### Data Management
- Regular PostgreSQL backups recommended.
- Prisma migrations for schema changes.

### Performance
- Indexed fields for fast lookups (email, IDs).
- Use of Prisma's query optimizations and relations.

---

For more details, see the Prisma schema file: `prisma/schema.prisma`.

---

# See README.md for project setup and usage. 