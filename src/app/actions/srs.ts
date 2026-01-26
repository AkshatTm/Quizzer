"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { fsrs, Grade, createEmptyCard, State } from "ts-fsrs";

// Initialize FSRS algorithm
const scheduler = fsrs();

interface CardWithProgress {
    cardId: string;
    front: string;
    back: string;
    hint?: string;
    progress: {
        due: Date;
        state: number;
        reps: number;
        lapses: number;
    } | null;
}

// Get cards due for review today
export async function getDueCards(quizId: string): Promise<CardWithProgress[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Check if user is a student
    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { id: session.user.id },
                { accessId: session.user.email?.replace("@student.local", "") },
            ],
        },
    });

    if (!student) return [];

    // Get the quiz content
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz || quiz.type !== "FLASHCARD") return [];

    const content = JSON.parse(quiz.content);
    const flashcards = content.flashcards || [];

    // Get existing progress for this student
    const progressRecords = await prisma.cardProgress.findMany({
        where: { studentId: student.id },
    });

    const progressMap = new Map(progressRecords.map((p: { cardId: string; dueDate: Date; state: number; reps: number; lapses: number }) => [p.cardId, p]));

    // Build cards with progress
    const now = new Date();
    const cardsWithProgress: CardWithProgress[] = flashcards.map((card: { front: string; back: string; hint?: string }, idx: number) => {
        const cardId = `${quizId}-${idx}`;
        const progress = progressMap.get(cardId);

        return {
            cardId,
            front: card.front,
            back: card.back,
            hint: card.hint,
            progress: progress
                ? {
                    due: progress.dueDate,
                    state: progress.state,
                    reps: progress.reps,
                    lapses: progress.lapses,
                }
                : null,
        };
    });

    // Return cards that are new or due today
    return cardsWithProgress.filter(
        (c: CardWithProgress) => !c.progress || c.progress.due <= now
    );
}

// Grade a card and update progress
export async function gradeCard(
    quizId: string,
    cardId: string,
    grade: "again" | "hard" | "good" | "easy"
): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check if user is a student
    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { id: session.user.id },
                { accessId: session.user.email?.replace("@student.local", "") },
            ],
        },
    });

    if (!student) throw new Error("Student not found");

    // Map grade string to FSRS Grade (1=Again, 2=Hard, 3=Good, 4=Easy)
    const gradeMap: Record<string, Grade> = {
        again: 1 as Grade,
        hard: 2 as Grade,
        good: 3 as Grade,
        easy: 4 as Grade,
    };

    const rating = gradeMap[grade];

    // Get existing progress
    const existingProgress = await prisma.cardProgress.findUnique({
        where: {
            studentId_cardId: {
                studentId: student.id,
                cardId,
            },
        },
    });

    // Create FSRS card
    const now = new Date();
    let card = createEmptyCard(now);

    // Restore card state from database if exists
    if (existingProgress) {
        card = {
            ...card,
            due: existingProgress.dueDate,
            stability: existingProgress.stability,
            difficulty: existingProgress.difficulty,
            elapsed_days: existingProgress.elapsedDays,
            scheduled_days: existingProgress.scheduledDays,
            reps: existingProgress.reps,
            lapses: existingProgress.lapses,
            state: existingProgress.state as State,
            last_review: existingProgress.lastReview || undefined,
        };
    }

    // Schedule with FSRS using next() for single rating
    const schedulingInfo = scheduler.next(card, now, rating);
    const newCard = schedulingInfo.card;

    // Upsert progress
    await prisma.cardProgress.upsert({
        where: {
            studentId_cardId: {
                studentId: student.id,
                cardId,
            },
        },
        create: {
            studentId: student.id,
            cardId,
            stability: newCard.stability,
            difficulty: newCard.difficulty,
            elapsedDays: newCard.elapsed_days,
            scheduledDays: newCard.scheduled_days,
            reps: newCard.reps,
            lapses: newCard.lapses,
            state: newCard.state,
            dueDate: newCard.due,
            lastReview: now,
        },
        update: {
            stability: newCard.stability,
            difficulty: newCard.difficulty,
            elapsedDays: newCard.elapsed_days,
            scheduledDays: newCard.scheduled_days,
            reps: newCard.reps,
            lapses: newCard.lapses,
            state: newCard.state,
            dueDate: newCard.due,
            lastReview: now,
        },
    });

    revalidatePath(`/quiz/${quizId}/flashcards`);
}

// Get overall SRS stats for a student
export async function getSrsStats() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { id: session.user.id },
                { accessId: session.user.email?.replace("@student.local", "") },
            ],
        },
    });

    if (!student) return null;

    const progress = await prisma.cardProgress.findMany({
        where: { studentId: student.id },
    });

    const now = new Date();
    const dueToday = progress.filter((p: { dueDate: Date }) => p.dueDate <= now).length;
    const learning = progress.filter((p: { state: number }) => p.state === 1).length;
    const reviewing = progress.filter((p: { state: number }) => p.state === 2).length;
    const total = progress.length;

    return { dueToday, learning, reviewing, total };
}
