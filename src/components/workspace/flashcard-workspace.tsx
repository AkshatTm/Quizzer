"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, RefreshCcw, ThumbsDown, ThumbsUp, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FlashcardData {
    cardId: string;
    front: string;
    back: string;
    hint?: string;
}

interface FlashcardWorkspaceProps {
    title: string;
    cards: FlashcardData[];
    quizId: string;
    onGrade: (cardId: string, grade: "again" | "hard" | "good" | "easy") => Promise<void>;
}

export function FlashcardWorkspace({
    title,
    cards,
    quizId,
    onGrade,
}: FlashcardWorkspaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex) / cards.length) * 100;

    async function handleGrade(grade: "again" | "hard" | "good" | "easy") {
        if (isGrading || !currentCard) return;

        setIsGrading(true);
        try {
            await onGrade(currentCard.cardId, grade);

            if (currentIndex < cards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
                setShowHint(false);
            } else {
                setCompleted(true);
            }
        } catch (error) {
            console.error("Grading error:", error);
        } finally {
            setIsGrading(false);
        }
    }

    if (completed || cards.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-gradient-to-br from-tile-mint/50 to-tile-lavender/50">
                    <CardContent className="pt-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-serif font-bold mb-2">
                            {cards.length === 0 ? "No cards due!" : "Session Complete!"}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {cards.length === 0
                                ? "Check back later for more cards to review."
                                : `You reviewed ${cards.length} card${cards.length !== 1 ? "s" : ""}.`}
                        </p>
                        <Link href="/dashboard">
                            <Button className="btn-juicy">Return to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    <h1 className="text-xl font-serif font-bold">{title}</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {cards.length}
                </div>
            </header>

            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Flashcard */}
            <div className="max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.cardId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="perspective-1000"
                    >
                        <Card
                            className={`min-h-[300px] cursor-pointer transition-all duration-300 ${isFlipped
                                    ? "bg-gradient-to-br from-tile-mint/50 to-tile-butter/50"
                                    : "bg-gradient-to-br from-tile-lavender/50 to-tile-butter/50"
                                }`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                                <AnimatePresence mode="wait">
                                    {!isFlipped ? (
                                        <motion.div
                                            key="front"
                                            initial={{ rotateY: 180, opacity: 0 }}
                                            animate={{ rotateY: 0, opacity: 1 }}
                                            exit={{ rotateY: -180, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className="text-3xl font-serif font-bold mb-4">
                                                {currentCard.front}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Click to reveal answer
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="back"
                                            initial={{ rotateY: -180, opacity: 0 }}
                                            animate={{ rotateY: 0, opacity: 1 }}
                                            exit={{ rotateY: 180, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className="text-2xl font-medium">{currentCard.back}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Hint */}
                {currentCard.hint && !isFlipped && (
                    <div className="mt-4 text-center">
                        {showHint ? (
                            <p className="text-sm text-muted-foreground italic">
                                💡 Hint: {currentCard.hint}
                            </p>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowHint(true)}
                                className="gap-1"
                            >
                                <Eye className="w-4 h-4" />
                                Show Hint
                            </Button>
                        )}
                    </div>
                )}

                {/* Grading buttons (shown after flip) */}
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center gap-3 mt-8"
                    >
                        <Button
                            variant="outline"
                            onClick={() => handleGrade("again")}
                            disabled={isGrading}
                            className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleGrade("hard")}
                            disabled={isGrading}
                            className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                            <ThumbsDown className="w-4 h-4" />
                            Hard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleGrade("good")}
                            disabled={isGrading}
                            className="gap-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            Good
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleGrade("easy")}
                            disabled={isGrading}
                            className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                            <Zap className="w-4 h-4" />
                            Easy
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
