import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { CodingWorkspace } from "@/components/workspace/coding-workspace";
import { StandardQuizWorkspace } from "@/components/workspace/standard-quiz-workspace";
import { submitQuiz } from "@/app/actions/quiz";
import { createDispute } from "@/app/actions/dispute";

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

    // FLASHCARD: redirect to the dedicated flashcards page
    if (quiz.type === "FLASHCARD") {
        redirect(`/quiz/${quizId}/flashcards`);
    }

    // CODING: render coding workspace
    if (quiz.type === "CODING" && content.codingChallenge) {
        const allowedLanguages: string[] = content.codingChallenge.allowedLanguages || ["python"];
        return (
            <CodingWorkspace
                title={quiz.title}
                challenge={content.codingChallenge}
                allowedLanguages={allowedLanguages}
            />
        );
    }

    // STANDARD: render MCQ quiz workspace
    if (quiz.type === "STANDARD" && content.questions) {
        async function handleSubmit(score: number, maxScore: number, answers: number[]) {
            "use server";
            await submitQuiz({
                quizId,
                answers: JSON.stringify(answers),
                score,
                maxScore,
            });
        }

        async function handleDispute(questionIdx: number, comment: string) {
            "use server";
            await createDispute(quizId, questionIdx, comment);
        }

        return (
            <StandardQuizWorkspace
                title={quiz.title}
                description={quiz.description || undefined}
                questions={content.questions}
                quizId={quizId}
                onSubmit={handleSubmit}
                onDispute={handleDispute}
            />
        );
    }

    // Fallback for malformed quizzes
    return (
        <main className="min-h-screen p-6 md:p-12">
            <h1 className="text-2xl font-serif font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
            <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-center text-muted-foreground">
                    This quiz has no content yet. Please contact your teacher.
                </p>
            </div>
        </main>
    );
}
