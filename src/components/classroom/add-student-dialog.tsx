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
    const [accessId, setAccessId] = useState("");
    const [bulkNames, setBulkNames] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit() {
        setIsLoading(true);
        setError("");
        try {
            if (mode === "single") {
                await addStudent(classroomId, name, accessId || undefined);
                setName("");
                setAccessId("");
            } else {
                const entries = bulkNames
                    .split("\n")
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => {
                        const parts = line.split(",").map(p => p.trim());
                        return {
                            name: parts[0],
                            accessId: parts[1] || undefined,
                        };
                    });
                if (entries.length > 0) {
                    await addMultipleStudents(classroomId, entries);
                    setBulkNames("");
                }
            }
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add student");
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
                        Add students to this classroom. You can set a custom Access ID or leave it blank to auto-generate.
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

                {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>
                )}

                <div className="space-y-4 py-2">
                    {mode === "single" ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="studentName">Student Name *</Label>
                                <Input
                                    id="studentName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studentAccessId">Access ID (optional)</Label>
                                <Input
                                    id="studentAccessId"
                                    value={accessId}
                                    onChange={(e) => setAccessId(e.target.value)}
                                    placeholder="Leave blank to auto-generate"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Students use this ID to log in. Must be unique.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="bulkNames">Students (one per line)</Label>
                            <Textarea
                                id="bulkNames"
                                value={bulkNames}
                                onChange={(e) => setBulkNames(e.target.value)}
                                placeholder={"John Doe, JOHN123\nJane Smith, JANE456\nAlex Johnson"}
                                rows={6}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: <code>Name, AccessID</code> (AccessID is optional).{" "}
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
