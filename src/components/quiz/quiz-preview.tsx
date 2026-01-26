"use client";

import { GeneratedQuizContent } from "@/app/actions/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Code, BookOpen } from "lucide-react";

interface QuizPreviewProps {
    content: GeneratedQuizContent;
}

export function QuizPreview({ content }: QuizPreviewProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-serif text-2xl">{content.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{content.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {content.type === "STANDARD" && "📝 Standard Quiz"}
                        {content.type === "CODING" && "💻 Coding Challenge"}
                        {content.type === "FLASHCARD" && "🧠 Flashcards"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Standard Quiz Preview */}
                {content.type === "STANDARD" && content.questions && (
                    <div className="space-y-6">
                        {content.questions.map((q, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-muted/50">
                                <p className="font-medium mb-3">
                                    <span className="text-primary font-bold mr-2">Q{idx + 1}.</span>
                                    {q.question}
                                </p>
                                {q.options && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                                        {q.options.map((opt, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className={`p-2 rounded border ${optIdx === q.correctAnswer
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-border"
                                                    }`}
                                            >
                                                <span className="font-mono text-sm mr-2">
                                                    {String.fromCharCode(65 + optIdx)}.
                                                </span>
                                                {opt}
                                                {optIdx === q.correctAnswer && (
                                                    <CheckCircle2 className="inline w-4 h-4 ml-2" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {q.explanation && (
                                    <p className="text-sm text-muted-foreground mt-3 ml-6 italic">
                                        💡 {q.explanation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Coding Challenge Preview */}
                {content.type === "CODING" && content.codingChallenge && (
                    <div className="space-y-6">
                        <div className="prose prose-sm max-w-none">
                            <h3 className="flex items-center gap-2 font-serif">
                                <Code className="w-5 h-5" />
                                Problem Description
                            </h3>
                            <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                                {content.codingChallenge.problemDescription}
                            </div>
                        </div>

                        {content.codingChallenge.constraints.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Constraints</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {content.codingChallenge.constraints.map((c, idx) => (
                                        <li key={idx} className="highlight-marker inline">{c}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-3">Examples</h4>
                            {content.codingChallenge.examples.map((ex, idx) => (
                                <div key={idx} className="mb-4 p-3 rounded bg-muted/30 font-mono text-sm">
                                    <p><span className="text-muted-foreground">Input:</span> {ex.input}</p>
                                    <p><span className="text-muted-foreground">Output:</span> {ex.output}</p>
                                    {ex.explanation && (
                                        <p className="text-muted-foreground mt-1">→ {ex.explanation}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-3">
                                Test Cases ({content.codingChallenge.testCases.length} total)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {content.codingChallenge.testCases.map((tc, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-2 rounded text-sm font-mono ${tc.isHidden ? "bg-muted/30 text-muted-foreground" : "bg-tile-mint/30"
                                            }`}
                                    >
                                        <span className="text-xs">
                                            {tc.isHidden ? "🔒 Hidden" : "👁 Visible"}
                                        </span>
                                        <p className="truncate">In: {tc.input}</p>
                                        <p className="truncate">Out: {tc.expectedOutput}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Flashcard Preview */}
                {content.type === "FLASHCARD" && content.flashcards && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">{content.flashcards.length} cards</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {content.flashcards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-lg border bg-gradient-to-br from-tile-butter/30 to-tile-lavender/30 min-h-[120px]"
                                >
                                    <p className="font-semibold text-lg mb-2">{card.front}</p>
                                    <Separator className="my-2" />
                                    <p className="text-muted-foreground">{card.back}</p>
                                    {card.hint && (
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                            Hint: {card.hint}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
