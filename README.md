# LearnPad - Interactive Mathematics Workspace

## Project Overview

**Industry:** Education Technology  
**Developer:** Kareem Moore  
**Completion Date:** 05/30/2025   
**Trello:** https://trello.com/b/OV8wdAlR/capstone


---

## Business Problem

### Problem Statement
Traditional mathematics education often struggles to engage students and provide immediate feedback. Students and teachers lack a modern, interactive platform for practicing and teaching mathematical concepts, tracking progress, and collaborating in real time. Existing solutions are often too complex, lack real-time support, or do not provide the necessary tools for effective learning and management.

### Target Users
- **Students:** Need an interactive, intuitive workspace to practice and submit math work, receive feedback, and track progress.
- **Teachers:** Require tools to monitor student progress, manage cohorts, review submissions, and provide feedback.
- **Admins:** Oversee platform users, approve teachers, and manage user accounts.

### Current Solutions and Limitations
Current solutions are fragmented, with limited real-time collaboration, lack of AI-powered assistance, and insufficient tools for cohort management and progress tracking. Many platforms are not mobile-friendly or accessible.

---

## Solution Overview

### Project Description
LearnPad is a modern, AI-powered digital mathematics workspace that connects students and teachers in a collaborative environment. Students can practice math, save and submit work, and receive instant AI or teacher feedback. Teachers can manage cohorts, review student submissions, and track progress. Admins can manage users and approve teacher accounts. The platform is built for accessibility, responsiveness, and ease of use.

### Key Features
- Interactive mathematics workspace (via Polypad API)
- AI-powered learning assistant (via Playlab API)
- Teacher-student collaboration and feedback
- Cohort management and progress tracking
- Admin dashboard for user management and teacher approval

### Value Proposition
LearnPad offers a unified, easy-to-use platform that combines interactive math tools, real-time feedback, and robust cohort management. Its AI assistant and modern UI make it more effective and engaging than traditional solutions.

### AI Implementation
AI is used to provide instant feedback and assistance to students, helping them solve problems and understand concepts. The AI leverages the Playlab API for natural language understanding and response generation.

### Technology Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes, Prisma
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js (with Google and credentials)
- **AI Services:** Playlab API
- **Math Workspace:** Polypad API
- **Deployment:** Vercel
- **Other Tools:** Prisma, bcryptjs, Trello (project management)

---

## Technical Implementation

### Wireframes & System Architecture
The application uses a modular Next.js structure with API routes for backend logic, React components for the UI, and Prisma for database access.  
**[Insert architecture diagram here]**

### Database Schema
See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for details.  
**Key tables:** User, Cohort, SavedWork, PendingTeacher  
**Relationships:**  
- Users can be students, teachers, or admins
- Students belong to cohorts
- Teachers manage cohorts
- SavedWork links students to their submissions

### AI Model Details
- **Model(s) Used:** Playlab API
- **Purpose:** Provide instant math help and feedback
- **Integration Method:** API calls from Next.js API routes
- **Model Performance Metrics:** [Add if available]

#### Key Components and Code Snippets

**Component 1: AIChatbot**
Handles student-AI interactions and displays responses.
// Example code snippet here

**Component 2: Cohort Management**
Allows teachers to create, manage, and assign students to cohorts.
// Example code snippet here

**AI Integration**
```js
const response = await playlabApi.createChatCompletion({ ... });
```

**Authentication and Authorization**
- Uses NextAuth.js for Google and credentials login
- Roles: student, teacher, admin
- Admins can approve teachers and manage users

**API Routes**
| Endpoint                        | Method | Purpose                        | Auth Required |
|----------------------------------|--------|--------------------------------|--------------|
| /api/auth/register              | POST   | Register new user              | No           |
| /api/auth/[...nextauth]         | ALL    | Auth endpoints                 | No           |
| /api/admin/user-management      | GET    | List all users                 | Yes (admin)  |
| /api/admin/user-management      | POST   | Reset user password            | Yes (admin)  |
| /api/admin/user-management      | DELETE | Delete user                    | Yes (admin)  |
| /api/admin/approve-teacher      | GET    | List pending teachers          | Yes (admin)  |
| /api/admin/approve-teacher      | POST   | Approve/reject teacher         | Yes (admin)  |
| /api/teacher/cohorts            | GET    | List teacher's cohorts         | Yes (teacher)|
| /api/student/work               | POST   | Submit student work            | Yes (student)|

---

## User Interface and Experience

### User Journey
1. User arrives at the application
2. User creates an account or logs in (Google or credentials)
3. Students join cohorts, submit work, and interact with AI/teachers
4. Teachers manage cohorts, review work, and provide feedback
5. Admins manage users and approve teachers

### Key Screens and Components
- **Admin Dashboard:** User management, teacher approval
- **Teacher Dashboard:** Cohort and student management, work review
- **Student Workspace:** Math workspace (Polypad API), AI chat (Playlab API), submission history

### Responsive Design Approach
Built with Tailwind CSS for mobile-first, responsive layouts.

### Accessibility Considerations
Semantic HTML, keyboard navigation, and color contrast for accessibility.

---

## Testing and Quality Assurance

### Testing Approach
Manual and automated testing of core flows.

### Unit Tests
[Add details if available]

### Integration Tests
[Add details if available]

### User Testing Results
[Add details if available]

### Known Issues and Limitations
- Real-time collaboration in development
- Mobile experience improvements planned

---

## Deployment

### Deployment Architecture
  
**Environment Variables:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js |
| `NEXTAUTH_URL` | Base URL of your application |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PLAYLAB_API_KEY` | Playlab API key for AI assistant |
| `POLYPAD_API_KEY` | Polypad API key for math workspace |

---

### Required API Keys & Services

To run LearnPad, you will need API keys or credentials for the following services:

- **Playlab API**: For AI-powered math assistance
- **Polypad API**: For the interactive mathematics workspace
- **Google OAuth**: For Google login (Google Client ID and Secret)
- **PostgreSQL Database**: For data storage (connection string)
- **NextAuth.js Secret**: For authentication session security

You will need to sign up for these services and add the corresponding keys to your `.env.local` file as described above.

### Build and Deployment Process
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run dev server: `npm run dev`
5. Build for production: `npm run build && npm start`

---

## Future Enhancements

### Planned Features
- Real-time collaboration
- Enhanced analytics
- Improved mobile experience

### Scalability Considerations
Stateless API routes, scalable database, and serverless deployment.

### AI Improvements
Custom math models, more contextual feedback.

---

## Lessons Learned

### Technical Challenges
- Migrating from MongoDB to PostgreSQL/Prisma
- Integrating AI with real-time feedback
- Role-based authentication and authorization

### AI Implementation Insights
- Prompt engineering is key for quality feedback

### What Went Well
- Smooth migration to Prisma/PostgreSQL
- Clean, modern UI

### What Could Be Improved
- More automated testing
- Earlier focus on mobile UX

---

## Project Management

### Development Timeline
[Add your timeline here]

### Tools and Resources Used
- Trello, GitHub, Prisma docs, Next.js docs, Playlab API docs, Polypad API docs

---

## Conclusion

LearnPad delivers a modern, AI-powered math learning experience for students and teachers, with robust admin controls and a scalable, maintainable codebase.

---

## Appendix

### Setup Instructions

```bash
# Clone the repository
git clone [repository URL]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```


