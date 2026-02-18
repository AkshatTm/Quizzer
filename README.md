# CodeCanvas (OpenQuiz)

> Where coding assessments feel like creative puzzles rather than exams.

An interactive, AI-powered educational platform with gamified learning, coding challenges, and spaced-repetition flashcards.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

## ✨ Features

### 🎓 For Teachers
- **Magic Input** - Describe what you want to teach in plain English, Gemini AI generates quiz content
- **Class Manager** - Create classrooms, add students with unique Access IDs
- **Three Quiz Types**:
  - 📝 Standard (MCQ, short answer)
  - 💻 Coding (with auto-generated test cases)
  - 🧠 Flashcards (with spaced repetition)
- **Dispute System** - Students can flag questions for review

### 👨‍🎓 For Students
- **Bento Workspace** - Split-view coding environment with Monaco Editor
- **Real-time Code Execution** - Run code securely via Piston sandbox
- **Traffic Light Feedback** - Instant visual test results
- **Spaced Repetition** - FSRS algorithm tracks learning progress

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for code execution)
- Google OAuth credentials (for teacher login)
- Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/AkshatTm/Quizzer.git
cd quizzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Initialize the database
npx prisma migrate dev

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth.js
AUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Piston (Code Execution)
PISTON_URL=http://localhost:2000
```

### Running Piston (Code Execution)

```bash
docker-compose up -d piston
```

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Auth.js routes
│   │   └── code/execute/   # Piston API proxy
│   ├── actions/            # Server actions
│   │   ├── classroom.ts    # Classroom CRUD
│   │   ├── quiz.ts         # Quiz + AI generation
│   │   ├── execute.ts      # Code execution
│   │   └── srs.ts          # Spaced repetition
│   ├── dashboard/          # Teacher dashboard
│   ├── quiz/[quizId]/      # Quiz-taking pages
│   └── login/              # Authentication
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── classroom/          # Classroom management
│   ├── quiz/               # Quiz preview
│   └── workspace/          # Student workspace
│       ├── bento-grid.tsx
│       ├── code-editor.tsx
│       ├── problem-tile.tsx
│       ├── test-runner-tile.tsx
│       ├── coding-workspace.tsx
│       └── flashcard-workspace.tsx
└── lib/
    ├── auth.ts             # Auth.js config
    └── db.ts               # Prisma client
```

## 🎨 Design System

**Warm Minimalism** aesthetic:
- Cream background (`#FFFBF5`)
- Electric Violet accent (`#7C3AED`)
- Pastel Bento tiles (Lavender, Mint, Butter)
- Fraunces serif + Inter sans + Fira Code mono
- Grain texture overlay
- Highlighter marker effect

## 📚 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 + App Router |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite + Prisma 5 |
| Auth | Auth.js (NextAuth v5) |
| AI | Google Gemini API |
| Code Execution | Piston (Docker) |
| Spaced Repetition | ts-fsrs |
| Editor | Monaco Editor |

## 🛣️ Roadmap

- [ ] Standard quiz UI
- [ ] Dispute resolution flow
- [ ] Analytics dashboard
- [ ] Vercel deployment guide
- [ ] PostgreSQL migration

## 📄 License

MIT

---

Built with ❤️ by [Akshat](https://github.com/AkshatTm)
