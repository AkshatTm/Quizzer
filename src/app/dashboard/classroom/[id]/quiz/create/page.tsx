"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateQuizWithAI, createQuiz, GeneratedQuizContent } from "@/app/actions/quiz";
import { QuizPreview } from "@/components/quiz/quiz-preview";

interface CreateQuizPageProps {
    params: Promise<{ id: string }>;
}

export default function CreateQuizPage({ params }: CreateQuizPageProps) {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedQuizContent | null>(null);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleGenerate() {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError("");
        setGeneratedContent(null);

        try {
            const content = await generateQuizWithAI(prompt);
            setGeneratedContent(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate quiz");
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleSave() {
        if (!generatedContent) return;

        setIsSaving(true);
        try {
            await createQuiz({
                title: generatedContent.title,
                description: generatedContent.description,
                type: generatedContent.type,
                content: JSON.stringify(generatedContent),
            });

            const { id } = await params;
            router.push(`/dashboard/classroom/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="min-h-screen p-6 md:p-12">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold">Create a Quiz</h1>
                    <p className="text-muted-foreground">Use AI to generate engaging content</p>
                </div>
            </header>

            {/* Magic Input */}
            {!generatedContent ? (
                <div className="max-w-3xl mx-auto">
                    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-tile-lavender/20 to-tile-mint/20">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-3xl font-serif">
                                ✨ What do you want to teach today?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., Create a medium difficulty Python quiz about recursion with 5 questions..."
                                className="min-h-[150px] text-lg border-0 bg-transparent focus-visible:ring-0 resize-none text-center"
                                disabled={isGenerating}
                            />

                            {error && (
                                <p className="text-destructive text-center mt-4">{error}</p>
                            )}

                            <div className="flex justify-center mt-6">
                                <Button
                                    size="lg"
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || isGenerating}
                                    className="btn-juicy gap-2 px-8 py-6 text-lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate with AI
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Suggestion chips */}
                            <div className="flex flex-wrap justify-center gap-2 mt-8">
                                {[
                                    "Create a Python coding challenge about sorting algorithms",
                                    "Generate 10 JavaScript MCQ questions for beginners",
                                    "Make flashcards for JLPT N5 Hiragana",
                                    "Quiz on React hooks with 5 questions",
                                ].map((suggestion) => (
                                    <Button
                                        key={suggestion}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setPrompt(suggestion)}
                                        disabled={isGenerating}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Preview Generated Content */
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif font-semibold">Preview Generated Content</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setGeneratedContent(null)}
                            >
                                Start Over
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-juicy gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Quiz"
                                )}
                            </Button>
                        </div>
                    </div>

                    <QuizPreview content={generatedContent} />
                </div>
            )}
        </main>
    );
}
