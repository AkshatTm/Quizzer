"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ============================================
// DISPUTE ACTIONS
// ============================================

export async function createDispute(
    quizId: string,
    questionIdx: number,
    comment: string
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const dispute = await prisma.dispute.create({
        data: {
            quizId,
            questionIdx,
            comment,
            status: "PENDING",
        },
    });

    revalidatePath("/dashboard");
    return dispute;
}

export async function getDisputes() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Get all disputes for quizzes authored by this teacher
    return prisma.dispute.findMany({
        where: {
            quiz: {
                authorId: session.user.id,
            },
        },
        include: {
            quiz: { select: { title: true, content: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function resolveDispute(
    disputeId: string,
    action: "APPROVED" | "REJECTED",
    resolution: string
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership through quiz
    const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { quiz: true },
    });

    if (!dispute || dispute.quiz.authorId !== session.user.id) {
        throw new Error("Dispute not found");
    }

    // Update dispute status
    await prisma.dispute.update({
        where: { id: disputeId },
        data: {
            status: action,
            resolution,
            resolvedAt: new Date(),
        },
    });

    // If approved: global score update — award full points for that question
    // to all submissions that got it wrong
    if (action === "APPROVED") {
        const assignments = await prisma.assignment.findMany({
            where: { quizId: dispute.quizId },
            include: { submissions: true },
        });

        for (const assignment of assignments) {
            for (const submission of assignment.submissions) {
                try {
                    const answers = JSON.parse(submission.answers);
                    const content = JSON.parse(dispute.quiz.content);
                    const questions = content.questions || [];
                    const totalQuestions = questions.length;

                    if (totalQuestions > 0 && submission.maxScore) {
                        const pointsPerQuestion = submission.maxScore / totalQuestions;
                        // Check if student got this question wrong
                        const studentAnswer = answers[dispute.questionIdx];
                        const correctAnswer = questions[dispute.questionIdx]?.correctAnswer;

                        if (studentAnswer !== undefined && Number(studentAnswer) !== Number(correctAnswer)) {
                            // Award the points
                            await prisma.submission.update({
                                where: { id: submission.id },
                                data: {
                                    score: (submission.score || 0) + pointsPerQuestion,
                                },
                            });
                        }
                    }
                } catch {
                    // Skip submissions with invalid data
                }
            }
        }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/disputes");
}
