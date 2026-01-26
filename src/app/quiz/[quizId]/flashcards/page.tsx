import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { getDueCards, gradeCard } from "@/app/actions/srs";
import { FlashcardWorkspace } from "@/components/workspace/flashcard-workspace";

interface FlashcardsPageProps {
    params: Promise<{ quizId: string }>;
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const { quizId } = await params;

    // Fetch the quiz
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz || quiz.type !== "FLASHCARD") notFound();

    // Get due cards
    const dueCards = await getDueCards(quizId);

    // Grade handler (passed to client component)
    async function handleGrade(cardId: string, grade: "again" | "hard" | "good" | "easy") {
        "use server";
        await gradeCard(quizId, cardId, grade);
    }

    return (
        <FlashcardWorkspace
            title={quiz.title}
            cards={dueCards}
            quizId={quizId}
            onGrade={handleGrade}
        />
    );
}
