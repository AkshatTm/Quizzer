"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ============================================
// QUIZ ACTIONS
// ============================================

export async function getQuizzes() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.quiz.findMany({
        where: { authorId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function getQuiz(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    return prisma.quiz.findFirst({
        where: { id, authorId: session.user.id },
    });
}

export async function createQuiz(data: {
    title: string;
    description?: string;
    type: "STANDARD" | "CODING" | "FLASHCARD";
    content: string; // JSON string
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const quiz = await prisma.quiz.create({
        data: {
            title: data.title,
            description: data.description,
            type: data.type,
            content: data.content,
            authorId: session.user.id,
        },
    });

    revalidatePath("/dashboard");
    return quiz;
}

export async function updateQuiz(id: string, data: {
    title?: string;
    description?: string;
    content?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const quiz = await prisma.quiz.update({
        where: { id, authorId: session.user.id },
        data,
    });

    revalidatePath("/dashboard");
    return quiz;
}

export async function deleteQuiz(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.quiz.delete({
        where: { id, authorId: session.user.id },
    });

    revalidatePath("/dashboard");
}

// ============================================
// AI GENERATION
// ============================================

export interface GeneratedQuizContent {
    title: string;
    description: string;
    type: "STANDARD" | "CODING" | "FLASHCARD";
    questions?: {
        question: string;
        options?: string[];
        correctAnswer: string | number;
        explanation?: string;
    }[];
    codingChallenge?: {
        problemDescription: string;
        constraints: string[];
        examples: { input: string; output: string; explanation?: string }[];
        starterCode: { [lang: string]: string };
        testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
    };
    flashcards?: {
        front: string;
        back: string;
        hint?: string;
    }[];
}

export async function generateQuizWithAI(prompt: string): Promise<GeneratedQuizContent> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an educational content creator AI. Based on the user's prompt, generate quiz content in JSON format.

Analyze the prompt to determine the quiz type:
- If it mentions "quiz", "questions", "MCQ", "test" -> type: "STANDARD"
- If it mentions "coding", "programming", "algorithm", "code" -> type: "CODING"
- If it mentions "flashcard", "vocabulary", "language", "memorize" -> type: "FLASHCARD"

Return ONLY valid JSON (no markdown, no code blocks) with this structure:

For STANDARD quizzes:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "type": "STANDARD",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ]
}

For CODING challenges:
{
  "title": "Challenge Title",
  "description": "Brief description",
  "type": "CODING",
  "codingChallenge": {
    "problemDescription": "Full problem in markdown",
    "constraints": ["Time: O(n)", "Space: O(1)"],
    "examples": [{"input": "...", "output": "...", "explanation": "..."}],
    "starterCode": {"python": "def solution():\\n    pass", "javascript": "function solution() {}"},
    "testCases": [
      {"input": "...", "expectedOutput": "...", "isHidden": false},
      {"input": "...", "expectedOutput": "...", "isHidden": true}
    ]
  }
}

For FLASHCARDS:
{
  "title": "Flashcard Deck Title",
  "description": "Brief description",
  "type": "FLASHCARD",
  "flashcards": [
    {"front": "Term or symbol", "back": "Definition or meaning", "hint": "Optional hint"}
  ]
}

Generate 5-10 items (questions/test cases/flashcards) unless specified otherwise.`;

    try {
        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `User prompt: ${prompt}` },
        ]);

        const response = result.response.text();

        // Clean up response - remove markdown code blocks if present
        let cleanJson = response.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.slice(7);
        }
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();

        const parsed = JSON.parse(cleanJson) as GeneratedQuizContent;
        return parsed;
    } catch (error) {
        console.error("AI generation error:", error);
        throw new Error("Failed to generate quiz content. Please try again.");
    }
}

// ============================================
// ASSIGNMENT ACTIONS
// ============================================

export async function assignQuizToClassroom(quizId: string, classroomId: string, deadline?: Date) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, authorId: session.user.id },
    });
    if (!quiz) throw new Error("Quiz not found");

    const classroom = await prisma.classroom.findFirst({
        where: { id: classroomId, teacherId: session.user.id },
    });
    if (!classroom) throw new Error("Classroom not found");

    const assignment = await prisma.assignment.create({
        data: {
            quizId,
            classroomId,
            deadline,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/classroom/${classroomId}`);
    return assignment;
}

// ============================================
// SUBMISSION ACTIONS
// ============================================

export async function submitQuiz(data: {
    assignmentId?: string;
    quizId: string;
    answers: string; // JSON string of answers
    score: number;
    maxScore: number;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Find student record
    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { id: session.user.id },
                { accessId: session.user.email?.replace("@student.local", "") },
            ],
        },
    });

    if (!student) throw new Error("Student not found");

    // If no assignmentId, find or create one
    let assignmentId = data.assignmentId;
    if (!assignmentId) {
        const assignment = await prisma.assignment.findFirst({
            where: {
                quizId: data.quizId,
                classroomId: student.classroomId,
            },
        });
        assignmentId = assignment?.id;
    }

    if (!assignmentId) throw new Error("Assignment not found");

    const submission = await prisma.submission.create({
        data: {
            studentId: student.id,
            assignmentId,
            answers: data.answers,
            score: data.score,
            maxScore: data.maxScore,
            gradedAt: new Date(),
        },
    });

    revalidatePath("/dashboard");
    return submission;
}

export async function getStudentSubmissions() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { id: session.user.id },
                { accessId: session.user.email?.replace("@student.local", "") },
            ],
        },
    });

    if (!student) return [];

    return prisma.submission.findMany({
        where: { studentId: student.id },
        include: {
            assignment: {
                include: { quiz: true },
            },
        },
        orderBy: { submittedAt: "desc" },
    });
}

export async function getStudentAssignments() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { id: session.user.id },
                { accessId: session.user.email?.replace("@student.local", "") },
            ],
        },
        include: { classroom: true },
    });

    if (!student) return [];

    const assignments = await prisma.assignment.findMany({
        where: {
            classroomId: student.classroomId,
            isOpen: true,
        },
        include: {
            quiz: true,
            submissions: {
                where: { studentId: student.id },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return assignments;
}
