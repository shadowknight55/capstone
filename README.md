# 📐 Polypad - Interactive Mathematics Workspace

A modern, AI-powered digital mathematics workspace that helps students learn and practice mathematical concepts through an intuitive interface. This platform connects students with teachers, provides real-time assistance, and offers a collaborative learning environment.

**Industry:** Education Technology  
**Developer:** [Kareem moore]  
**Completion Date:** [5/30/2025]  
**Live Demo:** *[Coming Soon]*

---

## 🧩 Business Problem

### 📝 Problem Statement  
Traditional mathematics education often struggles to engage students and provide immediate feedback. Students need a modern, interactive platform where they can practice mathematical concepts, receive instant assistance, and collaborate with teachers. The current solutions are either too complex, lack real-time support, or don't provide the necessary tools for effective learning.

### 🎯 Target Users  
- **Students** who need an interactive platform to practice mathematics
- **Teachers** who want to monitor student progress and provide guidance
- **Educational Institutions** looking to modernize their mathematics curriculum

### 🛠️ Current Solution  
A web-based platform that provides:
- Interactive mathematics workspace (Polypad)
- Real-time AI assistance
- Teacher-student collaboration
- Progress tracking and work history
- Cohort-based learning management

### ⚠️ Limitations  
- AI assistance is limited to text-based interactions
- Real-time collaboration features are in development
- Mobile responsiveness needs improvement

---

## 🚀 Project Overview

This platform aims to revolutionize mathematics education by offering:

- 🎯 Interactive mathematics workspace
- 🤖 AI-powered learning assistance
- 👥 Teacher-student collaboration
- 📊 Progress tracking and analytics
- 👨‍🏫 Cohort management system

---

## 🔧 Tech Stack

| Frontend         | Backend            | Database     | Authentication | AI & APIs   |
|------------------|--------------------|--------------|----------------|-------------|
| Next.js + React  | Next.js API Routes | PostgreSQL + Prisma | NextAuth.js    | OpenAI API  |

### Additional Tools:
- 🎨 Tailwind CSS for responsive design
- 🔒 NextAuth.js for secure authentication
- 🤖 OpenAI API for AI assistance
- ☁️ Vercel for deployment

---

## 📁 Project Structure

```
polypad/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── chat/         # AI chat endpoints
│   │   ├── student/      # Student-related endpoints
│   │   └── teacher/      # Teacher-related endpoints
│   ├── components/       # React components
│   │   ├── AIChatbot.js  # AI assistant component
│   │   └── ...          # Other components
│   ├── student/         # Student pages
│   ├── teacher/         # Teacher pages
│   └── public/          # Static assets
├── lib/                  # Utility functions
└── .env.local          # Environment variables
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/polypad.git
   cd polypad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js |
| `NEXTAUTH_URL` | Base URL of your application |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `OPENAI_API_KEY` | OpenAI API key for AI assistance |

---

## 🎯 Features

### For Students
- Interactive mathematics workspace
- AI-powered learning assistant
- Work history and progress tracking
- Cohort-based learning
- Real-time teacher feedback

### For Teachers
- Student progress monitoring
- Cohort management
- Work review and feedback
- Analytics dashboard
- Assignment creation and tracking

### Teacher Dashboard
- **Navigation Buttons:** Easily access Students, Cohorts, and Student Submissions from a clean dashboard.
- **Cohort Management:**
  - Create and delete cohorts
  - Clickable, clearly styled cohort list
  - Add students to cohorts (from the Cohorts page)
  - Remove students from cohorts
- **Student Submissions:**
  - View all student work grouped by cohort and student
  - Click a student to see only their submissions
  - Click on a screenshot to view it larger in a modal
  - See submission titles, descriptions, and images
- **Responsive, modern UI:**
  - Clean, accessible, and mobile-friendly
  - Clear navigation and feedback

### Admin Dashboard
- Approve or reject pending teacher accounts
- Secure admin-only access

### Student Experience
- Students can save work (with title, description, screenshot) to a cohort
- Work is visible to teachers in the Student Submissions section

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🛡️ License

MIT License — free to use, modify, and distribute.

---

## 📞 Support

For support, please open an issue in the GitHub repository or contact [your contact information].

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for the current PostgreSQL/Prisma schema and relationships.

## Technical Documentation

See [TECH_DOC.md](./TECH_DOC.md) for setup, running, and usage instructions.