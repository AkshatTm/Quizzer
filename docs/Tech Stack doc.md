# Technical Stack Documentation: OpenQuiz
**Version:** 1.0  
**Target Audience:** Student Developer  
**Cost Model:** $0.00 (Leveraging Open Source, Azure for Students, and Gemini Free Tier)

## 1. High-Level Architecture
OpenQuiz typically follows a "Micro-Monolith" architecture. This means the frontend and backend logic reside in a single Next.js application, simplifying development and deployment. However, the heavy lifting (Code Execution) and state management (Database) are offloaded to specialized services running in Docker containers or managed cloud infrastructure.

### The "Student Stack" Summary

| Component | Technology Selected | Justification | Cost |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Unified frontend/backend, server actions, easy API creation. | Free (OSS) |
| **Language** | **TypeScript** | Type safety is critical for complex data (test cases, grades). | Free (OSS) |
| **Database** | **PostgreSQL** | Relational data integrity for classrooms and grades. | Free (Azure Tier) |
| **ORM** | **Prisma** | Best-in-class developer experience for TypeScript + Postgres. | Free (OSS) |
| **Auth** | **Auth.js (NextAuth v5)** | Handles Google (Teacher) and Credential (Student ID) login seamlessly. | Free (OSS) |
| **Code Sandbox** | **Piston** | Pre-built, secure, Docker-based code execution engine. | Free (OSS) |
| **Code Editor** | **Monaco Editor** | The VS Code editor engine; standard for "LeetCode" style apps. | Free (OSS) |
| **AI Model** | **Gemini 1.5 Pro** | Generates test cases; huge context window, JSON mode support. | Free (API Tier) |
| **Spaced Repetition** | **ts-fsrs** | Library implementing the FSRS algorithm (superior to Anki's SM-2). | Free (OSS) |
| **Hosting** | **Azure VM (Linux)** | Hosts the app and Piston via Docker Compose. | Free ($100 Credit) |

## 2. Component Breakdown

### 2.1. Frontend & User Interface
*   **Core Framework:** Next.js
*   **Styling:** Tailwind CSS (Utility-first, fast development) + shadcn/ui (Copy-paste accessible components).
*   **State Management:** Zustand (Simpler/lighter than Redux for managing code editor state).
*   **Code Editor:** `@monaco-editor/react`
    *   **Why:** This is a wrapper for Microsoft's Monaco Editor (used in VS Code). It provides Intellisense, syntax highlighting, and minimaps out of the box, essential for the "Technical Skill Verification" requirement.
*   **Flashcards:** `framer-motion`
    *   **Usage:** For the "swipe" or "flip" animations in the Language Learning mode.

### 2.2. Backend & API
*   **Runtime:** Node.js (via Next.js Server Actions).
*   **Authentication:** NextAuth.js (v5 Beta recommended for App Router).
    *   **Strategy:**
        *   **Teachers:** Google Provider (OAuth).
        *   **Students:** Credentials Provider. (You will store studentID hashes in the DB and validate against them).
*   **Data Access:** Prisma ORM.
    *   **Why:** Auto-generated types derived from your database schema prevent 90% of runtime errors.

### 2.3. The Sandbox (Code Execution Engine)
*   **Tool:** Piston (by Engineer Man).
*   **Repository:** https://github.com/engineer-man/piston
    *   **Why:** Building a secure sandbox from scratch using dockerode is dangerous and complex (fork bombs, infinite loops, network attacks). Piston is a production-ready, open-source API that manages these Docker containers for you.
*   **Integration:** You will run Piston as a separate service in your `docker-compose.yml`. Your Next.js backend will send HTTP POST requests to `http://piston:2000/api/v2/execute` with the student's code.

### 2.4. Spaced Repetition System (SRS)
*   **Library:** `ts-fsrs`
    *   **Why:** The PRD requests an SRS algorithm. The Free Spaced Repetition Scheduler (FSRS) is modern and efficient. This library handles the complex math of calculating "Next Review Date" based on user ratings (Good, Hard, Easy).
*   **Implementation:** When a student rates a flashcard, you pass the card's history to this library, get the new due date, and save it to Postgres.

### 2.5. AI Integration
*   **Model:** Gemini 1.5 Pro (via Google AI Studio).
*   **Usage:**
    *   **Test Case Generation:** Teacher inputs a problem description. Gemini outputs a JSON array of inputs/outputs.
    *   **Flashcard Generation:** Teacher inputs a topic (e.g., "JLPT N5 Kanji"); Gemini outputs JSON front/back card data.
*   **Key Feature:** Use JSON Mode (Structured Outputs) to ensure Gemini returns valid data your app can parse automatically.

## 3. Infrastructure & Hosting Strategy
Since you have $100 Azure Credit, we can design a robust architecture that fits within this budget for a long time.

### 3.1. Database: Azure Database for PostgreSQL - Flexible Server
*   **Tier:** Burstable B1ms
*   **Cost:** Free for 12 months (750 hours/month) under Azure Student benefits.
*   **Config:**
    *   32GB Storage.
    *   Public access (restricted to your VM's IP for security).

### 3.2. Application Server: Azure Virtual Machine
*   **Size:** Standard B2s (2 vCPUs, 4 GiB RAM)
*   **Cost:** ~$30-35/month. With your $100 credit, this runs for ~3 months 24/7, or much longer if you turn it off when not developing.
*   **Alternative (Free Tier): Standard B1s (1 vCPU, 1 GiB RAM). This is free for 12 months.**
    *   **Warning:** The B1s is extremely tight on RAM for running Next.js and Piston (Docker) simultaneously.
*   **Recommendation:** Start with B1s (Free). If it crashes due to Out-Of-Memory (OOM) errors during code execution, resize to B2s using your credit.
*   **OS:** Ubuntu Server 22.04 LTS.

### 3.3. Deployment Method: Docker Compose
You will use a single `docker-compose.yml` file to orchestrate the entire platform on your Azure VM.

**YAML**
```yaml
version: '3.8'
services:
  # The OpenQuiz Next.js App
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@azure-postgres-host:5432/db
      - PISTON_URL=http://piston:2000
      - GEMINI_API_KEY=your_key
    depends_on:
      - piston

  # Piston Code Execution Engine
  piston:
    image: ghcr.io/engineer-man/piston:latest
    tmpfs:
      - /tmp:exec
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # Needs access to host docker to spawn sandboxes
```

## 4. Development Roadmap Checklist

### Phase 1: Local Setup & Auth
- [ ] Initialize Next.js project: `npx create-next-app@latest`
- [ ] Set up Prisma with a local SQLite file (switch to Postgres later).
- [ ] Implement NextAuth with Google Provider (for you) and Credentials Provider (for students).

### Phase 2: Core Features
- [ ] Create the "Classroom" and "Student" data models in Prisma.
- [ ] Build the Monaco Editor component on the frontend.
- [ ] Spin up Piston locally via Docker Desktop.
- [ ] Write the API route to pass code from Monaco -> Next.js -> Piston -> Frontend.

### Phase 3: AI & SRS
- [ ] Get Gemini API Key.
- [ ] Create the "Test Case Generator" button using Gemini JSON mode.
- [ ] Implement `ts-fsrs` logic for the Flashcard API route.

### Phase 4: Azure Deployment
- [ ] Create Azure Postgres Flexible Server.
- [ ] Create Azure VM (Ubuntu).
- [ ] Install Docker & Docker Compose on the VM.
- [ ] Pull your repo, add `.env` variables, and run `docker-compose up -d`.

This stack is optimized for low cost, high learning value, and strictly adheres to your student constraints while delivering a professional-grade feature set.
