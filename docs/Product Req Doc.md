# Product Requirements Document (PRD)

**Project Name:** OpenQuiz (Working Title)  
**Version:** 1.1  
**Status:** Draft  
**License:** Open Source  

## 1. Executive Summary
OpenQuiz is an open-source, self-hosted assessment platform designed to bridge the gap between gamified learning and technical skill verification. It provides a classroom-based environment where teachers can assign self-paced homework in the form of standard quizzes, coding challenges, and spaced-repetition language flashcards. The system prioritizes fairness, feedback, and safe remote code execution.

## 2. User Roles
*   **Teacher:** The administrator of a "Classroom." Responsible for student onboarding, content creation (quizzes), and performance review.
*   **Student:** The consumer. Logs in via a unique ID to complete assignments within a deadline and view their standing on leaderboards.

## 3. Functional Requirements

### 3.1. Authentication & Onboarding
*   **Teacher Identity:**
    *   Standard email/password registration with "Forgot Password" flows.
    *   OAuth integration (e.g., Google) for one-click login.
*   **Student Identity (Classroom Model):**
    *   Students do not register via email to minimize friction and privacy concerns.
    *   **Workflow:** Teacher creates a Class $\rightarrow$ Adds Student Names $\rightarrow$ System generates unique, non-guessable Access IDs.
    *   Students log in solely using this Access ID.

### 3.2. Dashboard & Navigation
*   **Teacher Dashboard:**
    *   **Class Manager:** Interface to add/remove students and regenerate Access IDs.
    *   **Content Manager:** Tools to create, edit, delete, and "Fork" (duplicate) existing quizzes from other teachers.
    *   **Dispute Inbox:** A notification center for reviewing questions flagged by students.
    *   **Analytics View:** Visualizations for class averages, completion rates, and "Hardest Question" analysis.
*   **Student Dashboard:**
    *   **Assignment Stream:** List of active quizzes sorted by deadline.
    *   **Performance History:** Archive of past quizzes with scores and feedback.

### 3.3. Quiz Modes
The platform supports three distinct engines. A single quiz instance must be of one specific type.

*   **Mode A: Standard Quiz (Assessment Engine)**
    *   **Input:** Multiple Choice Questions (MCQ) or Short Text.
    *   **Behavior:** Standard form submission with immediate client-side validation (optional) and server-side scoring.
    *   **Scoring:** Binary (Correct/Incorrect).

*   **Mode B: Coding Challenge (Execution Engine)**
    *   **Workflow:**
        *   **Creation:** Teacher inputs problem description (Markdown) and input/output constraints.
        *   **Test Case Generation:** Teacher triggers an AI agent to generate edge cases. Teacher reviews and saves these cases as static JSON data.
        *   **Solving:** Student writes code in an in-browser editor (supporting syntax highlighting for C++, JS, Java, Python).
        *   **Execution:** Code is sent to the server, run against the saved test cases in an isolated environment, and results are returned.
        *   **Grading:** Partial credit based on the percentage of test cases passed (e.g., passing 8/10 hidden cases = 80% score).

*   **Mode C: Language Learning (Spaced Repetition Engine)**
    *   **Input:** Visual Flashcards (Character/Symbol identification).
    *   **Interaction:** GUI-based (Click to Reveal $\rightarrow$ Select Meaning).
    *   **Logic:** Spaced Repetition System (SRS). The backend tracks the "forgetting curve" for each student/card pair. Cards marked "incorrect" or "hard" are scheduled to reappear more frequently in future sessions than "easy" cards.

### 3.4. Feedback & Integrity System
*   **Dispute Mechanism:**
    *   Students can flag a question during or after the quiz with a text comment explaining the error.
    *   **Resolution:** If a teacher approves a dispute, the system triggers a Global Score Update, awarding full points for that specific question to all students in that class instance.
*   **Integrity:**
    *   **Honor Code:** No invasive proctoring (tab detection).
    *   **Social Pressure:** Public (Class-only) leaderboards to drive engagement.

## 4. System Design & Architecture

### 4.1. High-Level Architecture
The system follows a containerized, microservice-like architecture to separate the lightweight web application from the resource-heavy code execution engine.

*   **Frontend Client:** A responsive Single Page Application (SPA) handling user state, code editing (Monaco/Ace editor integration), and quiz rendering.
*   **API Gateway / Backend Server:** Handles authentication, business logic, CRUD operations for quizzes, and acts as the orchestrator for code execution.
*   **Primary Database:** Relational database storing:
    *   User/Class hierarchies.
    *   Quiz content and static Test Cases.
    *   Student submissions and SRS scheduling data.

### 4.2. The Remote Code Execution (RCE) Pipeline
To safely run untrusted student code, the system uses a Sandboxed Runner Pattern:

*   **Submission:** Student code + Language + Input Data is sent to the Backend.
*   **Queueing:** If traffic is high, requests are placed in a FIFO queue to prevent server overload.
*   **The Sandbox (Ephemeral Containers):**
    *   The system spins up a lightweight, isolated container (e.g., Docker) restricted by CPU and RAM limits.
    *   **Execution:** The code is compiled (if necessary) and executed against the test inputs.
    *   **Constraint Enforcement:** The container enforces strict timeouts (e.g., 2 seconds) to kill infinite loops.
    *   **Teardown:** Immediately after returning the Standard Output (stdout) or Error (stderr), the container is destroyed to ensure no state persists.
    *   **Response:** The output is compared against the expected output, and a pass/fail boolean is returned to the frontend.

### 4.3. Data Flow for SRS (Language Mode)
*   **Fetch:** When a student starts a session, the backend queries the database for cards due "today" based on the SRS algorithm.
*   **Update:** Upon answer submission, the algorithm calculates the next review date (Interval) based on the difficulty rating (Again, Hard, Good, Easy).
*   **Persist:** The new review date is updated in the student's progress table.

## 5. Non-Functional Requirements
*   **Security:**
    *   **Isolation:** The Code Execution Engine must be completely network-gated (no internet access inside the sandbox) to prevent malicious external calls.
    *   **Sanitization:** All teacher inputs (Markdown/Images) must be sanitized to prevent XSS attacks.
*   **Portability:** The entire system (Frontend + Backend + DB + Runner) must be defined in a container orchestration file (e.g., docker-compose.yml) for single-command deployment.
*   **Performance:** Code evaluation results should return to the user in under 5 seconds under normal load.
