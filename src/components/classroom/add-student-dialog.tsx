"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { addStudent, addMultipleStudents } from "@/app/actions/classroom";

interface AddStudentDialogProps {
    classroomId: string;
}

export function AddStudentDialog({ classroomId }: AddStudentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"single" | "bulk">("single");
    const [name, setName] = useState("");
    const [bulkNames, setBulkNames] = useState("");

    async function handleSubmit() {
        setIsLoading(true);
        try {
            if (mode === "single") {
                await addStudent(classroomId, name);
                setName("");
            } else {
                const names = bulkNames
                    .split("\n")
                    .map(n => n.trim())
                    .filter(n => n.length > 0);
                if (names.length > 0) {
                    await addMultipleStudents(classroomId, names);
                    setBulkNames("");
                }
            }
            setOpen(false);
        } catch (error) {
            console.error("Failed to add student:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="btn-juicy gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Students
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-serif">Add Students</DialogTitle>
                    <DialogDescription>
                        Add students to this classroom. Each student will receive a unique Access ID.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 mb-4">
                    <Button
                        type="button"
                        variant={mode === "single" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("single")}
                    >
                        Single
                    </Button>
                    <Button
                        type="button"
                        variant={mode === "bulk" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("bulk")}
                    >
                        Bulk Add
                    </Button>
                </div>

                <div className="space-y-4 py-2">
                    {mode === "single" ? (
                        <div className="space-y-2">
                            <Label htmlFor="studentName">Student Name</Label>
                            <Input
                                id="studentName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., John Doe"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="bulkNames">Student Names (one per line)</Label>
                            <Textarea
                                id="bulkNames"
                                value={bulkNames}
                                onChange={(e) => setBulkNames(e.target.value)}
                                placeholder="John Doe&#10;Jane Smith&#10;Alex Johnson"
                                rows={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                {bulkNames.split("\n").filter(n => n.trim()).length} students will be added
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || (mode === "single" ? !name : !bulkNames.trim())}
                        className="btn-juicy"
                    >
                        {isLoading ? "Adding..." : "Add Students"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
