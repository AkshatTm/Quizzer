"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy, Flag } from "lucide-react";
import Link from "next/link";

interface Question {
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
}

interface StandardQuizWorkspaceProps {
    title: string;
    description?: string;
    questions: Question[];
    quizId: string;
    assignmentId?: string;
    onSubmit?: (score: number, maxScore: number, answers: number[]) => Promise<void>;
    onDispute?: (questionIdx: number, comment: string) => Promise<void>;
}

export function StandardQuizWorkspace({
    title,
    description,
    questions,
    quizId: _quizId,
    assignmentId: _assignmentId,
    onSubmit,
    onDispute,
}: StandardQuizWorkspaceProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
        new Array(questions.length).fill(null)
    );
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDisputeForm, setShowDisputeForm] = useState<number | null>(null);
    const [disputeComment, setDisputeComment] = useState("");

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = selectedAnswers.filter((a) => a !== null).length;

    function selectAnswer(optionIndex: number) {
        if (isSubmitted) return;
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = optionIndex;
        setSelectedAnswers(newAnswers);
    }

    function goToQuestion(index: number) {
        if (index >= 0 && index < questions.length) {
            setCurrentQuestion(index);
        }
    }

    async function handleSubmit() {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Calculate score
        let score = 0;
        questions.forEach((q, idx) => {
            const selected = selectedAnswers[idx];
            if (selected !== null && selected === Number(q.correctAnswer)) {
                score++;
            }
        });

        try {
            await onSubmit?.(score, questions.length, selectedAnswers as number[]);
        } catch (error) {
            console.error("Submit error:", error);
        }

        setIsSubmitted(true);
        setIsSubmitting(false);
        setCurrentQuestion(0);
    }

    async function handleDispute(questionIdx: number) {
        if (!disputeComment.trim()) return;
        try {
            await onDispute?.(questionIdx, disputeComment);
            setShowDisputeForm(null);
            setDisputeComment("");
        } catch (error) {
            console.error("Dispute error:", error);
        }
    }

    // Submitted results view
    if (isSubmitted) {
        const score = questions.reduce((acc, q, idx) => {
            return acc + (selectedAnswers[idx] === Number(q.correctAnswer) ? 1 : 0);
        }, 0);
        const percentage = Math.round((score / questions.length) * 100);
        const allCorrect = score === questions.length;

        return (
            <div className="min-h-screen p-4 md:p-8">
                <header className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-serif font-bold">{title} — Results</h1>
                </header>

                {/* Score Card */}
                <div className="max-w-2xl mx-auto mb-8">
                    <Card className={`${allCorrect
                        ? "bg-gradient-to-br from-emerald-50 to-tile-mint/50 border-emerald-300"
                        : "bg-gradient-to-br from-tile-lavender/50 to-tile-butter/50"
                        }`}>
                        <CardContent className="pt-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="text-6xl mb-4"
                            >
                                {allCorrect ? "🎉" : percentage >= 70 ? "👏" : "📚"}
                            </motion.div>
                            <h2 className="text-3xl font-serif font-bold mb-2">
                                {score} / {questions.length}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-1">{percentage}% correct</p>
                            <p className="text-sm text-muted-foreground">
                                {allCorrect
                                    ? "Perfect score! Amazing work!"
                                    : percentage >= 70
                                        ? "Great job! Keep it up!"
                                        : "Keep practicing, you'll improve!"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Review */}
                <div className="max-w-2xl mx-auto space-y-4">
                    <h3 className="text-lg font-serif font-semibold">Review Answers</h3>
                    {questions.map((q, idx) => {
                        const isCorrect = selectedAnswers[idx] === Number(q.correctAnswer);
                        const selected = selectedAnswers[idx];

                        return (
                            <Card
                                key={idx}
                                className={`${isCorrect ? "border-emerald-300" : "border-red-300"}`}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        {isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        )}
                                        <p className="font-medium">
                                            <span className="text-primary font-bold mr-2">Q{idx + 1}.</span>
                                            {q.question}
                                        </p>
                                    </div>
                                    {q.options && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-8 mb-3">
                                            {q.options.map((opt, optIdx) => (
                                                <div
                                                    key={optIdx}
                                                    className={`p-2 rounded border text-sm ${optIdx === Number(q.correctAnswer)
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : optIdx === selected && !isCorrect
                                                            ? "border-red-400 bg-red-50 text-red-700"
                                                            : "border-border text-muted-foreground"
                                                        }`}
                                                >
                                                    <span className="font-mono mr-2">
                                                        {String.fromCharCode(65 + optIdx)}.
                                                    </span>
                                                    {opt}
                                                    {optIdx === Number(q.correctAnswer) && (
                                                        <CheckCircle className="inline w-4 h-4 ml-2 text-emerald-600" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {q.explanation && (
                                        <p className="text-sm text-muted-foreground ml-8 italic">
                                            💡 {q.explanation}
                                        </p>
                                    )}
                                    {/* Dispute button */}
                                    {!isCorrect && onDispute && (
                                        <div className="ml-8 mt-3">
                                            {showDisputeForm === idx ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Explain why this answer might be wrong..."
                                                        value={disputeComment}
                                                        onChange={(e) => setDisputeComment(e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border rounded text-sm"
                                                    />
                                                    <Button size="sm" onClick={() => handleDispute(idx)}>
                                                        Submit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setShowDisputeForm(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground gap-1"
                                                    onClick={() => setShowDisputeForm(idx)}
                                                >
                                                    <Flag className="w-3.5 h-3.5" />
                                                    Flag this question
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Active quiz view
    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-serif font-bold">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    {answeredCount}/{questions.length} answered
                </div>
            </header>

            {/* Progress */}
            <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question Navigation Pills */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToQuestion(idx)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${idx === currentQuestion
                            ? "bg-primary text-primary-foreground scale-110"
                            : selectedAnswers[idx] !== null
                                ? "bg-tile-mint text-emerald-700 border border-emerald-300"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            {/* Question Card */}
            <div className="max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="bg-gradient-to-br from-tile-lavender/30 to-tile-butter/20">
                            <CardHeader>
                                <CardTitle className="font-serif text-lg">
                                    <span className="text-primary font-bold mr-2">
                                        Q{currentQuestion + 1}.
                                    </span>
                                    {question.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {question.options?.map((option, optIdx) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => selectAnswer(optIdx)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${selectedAnswers[currentQuestion] === optIdx
                                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                                            }`}
                                    >
                                        <span className="font-mono text-sm text-muted-foreground mr-3">
                                            {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        {option}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={() => goToQuestion(currentQuestion - 1)}
                        disabled={currentQuestion === 0}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    {currentQuestion === questions.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={answeredCount < questions.length || isSubmitting}
                            className="btn-juicy gap-2"
                        >
                            <Trophy className="w-4 h-4" />
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => goToQuestion(currentQuestion + 1)}
                            className="gap-2"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
