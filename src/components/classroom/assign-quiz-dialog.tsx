"use client";

import { useState } from "react";
import { assignQuizToClassroom } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon } from "lucide-react";

interface AssignQuizDialogProps {
    classroomId: string;
    availableQuizzes: { id: string; title: string; type: string }[];
}

export function AssignQuizDialog({ classroomId, availableQuizzes }: AssignQuizDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [deadline, setDeadline] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleAssign() {
        if (!selectedQuiz) return;
        setIsLoading(true);

        try {
            await assignQuizToClassroom(
                selectedQuiz,
                classroomId,
                deadline ? new Date(deadline) : undefined
            );
            setOpen(false);
            setSelectedQuiz(null);
            setDeadline("");
        } catch (error) {
            console.error("Failed to assign quiz:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Assign Quiz
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-serif">Assign a Quiz</DialogTitle>
                    <DialogDescription>
                        Select a quiz to assign to this classroom.
                    </DialogDescription>
                </DialogHeader>

                {availableQuizzes.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No quizzes available to assign.</p>
                        <p className="text-sm mt-1">Create a quiz first, then assign it here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Quiz selection */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableQuizzes.map((quiz) => (
                                <button
                                    key={quiz.id}
                                    onClick={() => setSelectedQuiz(quiz.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedQuiz === quiz.id
                                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                            : "border-border hover:border-primary/30"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{quiz.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {quiz.type}
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline (optional)</Label>
                            <Input
                                id="deadline"
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <Button
                            onClick={handleAssign}
                            disabled={!selectedQuiz || isLoading}
                            className="w-full btn-juicy"
                        >
                            {isLoading ? "Assigning..." : "Assign Quiz"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
