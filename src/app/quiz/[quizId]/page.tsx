import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { CodingWorkspace } from "@/components/workspace/coding-workspace";

interface QuizPageProps {
    params: Promise<{ quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const { quizId } = await params;

    // Fetch the quiz
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
    });

    if (!quiz) notFound();

    const content = JSON.parse(quiz.content);

    // Render based on quiz type
    if (quiz.type === "CODING" && content.codingChallenge) {
        return (
            <CodingWorkspace
                title={quiz.title}
                challenge={content.codingChallenge}
                language="python"
            />
        );
    }

    // For STANDARD and FLASHCARD types (to be implemented)
    return (
        <main className="min-h-screen p-6 md:p-12">
            <h1 className="text-2xl font-serif font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
            <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-center text-muted-foreground">
                    {quiz.type === "STANDARD" && "Standard quiz interface coming in next phase..."}
                    {quiz.type === "FLASHCARD" && "Flashcard interface coming in Phase 5..."}
                </p>
            </div>
        </main>
    );
}
