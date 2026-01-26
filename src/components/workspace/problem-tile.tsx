"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProblemTileProps {
    title: string;
    description: string;
    constraints?: string[];
    examples?: {
        input: string;
        output: string;
        explanation?: string;
    }[];
}

export function ProblemTile({ title, description, constraints, examples }: ProblemTileProps) {
    return (
        <Card className="h-full flex flex-col bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
                <CardTitle className="font-serif text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        {/* Description */}
                        <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{description}</p>
                        </div>

                        {/* Constraints */}
                        {constraints && constraints.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Constraints</h4>
                                <ul className="space-y-1">
                                    {constraints.map((c, i) => (
                                        <li key={i} className="text-sm">
                                            <span className="highlight-marker px-1">{c}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Examples */}
                        {examples && examples.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Examples</h4>
                                <div className="space-y-3">
                                    {examples.map((ex, i) => (
                                        <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm font-mono">
                                            <div className="text-muted-foreground">
                                                <span className="font-sans font-medium text-foreground">Input: </span>
                                                <code>{ex.input}</code>
                                            </div>
                                            <div className="text-muted-foreground mt-1">
                                                <span className="font-sans font-medium text-foreground">Output: </span>
                                                <code>{ex.output}</code>
                                            </div>
                                            {ex.explanation && (
                                                <div className="text-muted-foreground mt-2 font-sans text-xs italic">
                                                    → {ex.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
