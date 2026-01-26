"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, RefreshCw, Trash2, Check } from "lucide-react";
import { regenerateAccessId, removeStudent } from "@/app/actions/classroom";

interface Student {
    id: string;
    name: string;
    accessId: string;
    createdAt: Date;
}

interface StudentTableProps {
    students: Student[];
    classroomId: string;
}

export function StudentTable({ students, classroomId }: StudentTableProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function copyAccessId(accessId: string) {
        await navigator.clipboard.writeText(accessId);
        setCopiedId(accessId);
        setTimeout(() => setCopiedId(null), 2000);
    }

    async function handleRegenerate(studentId: string) {
        setLoadingId(studentId);
        try {
            await regenerateAccessId(studentId);
        } catch (error) {
            console.error("Failed to regenerate access ID:", error);
        } finally {
            setLoadingId(null);
        }
    }

    async function handleRemove(studentId: string) {
        if (!confirm("Are you sure you want to remove this student?")) return;

        setLoadingId(studentId);
        try {
            await removeStudent(studentId);
        } catch (error) {
            console.error("Failed to remove student:", error);
        } finally {
            setLoadingId(null);
        }
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No students yet. Add your first student to get started!</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Access ID</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono tracking-wider">
                                    {student.accessId}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyAccessId(student.accessId)}
                                >
                                    {copiedId === student.accessId ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {new Date(student.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={loadingId === student.id}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleRegenerate(student.id)}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Regenerate ID
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleRemove(student.id)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove Student
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
