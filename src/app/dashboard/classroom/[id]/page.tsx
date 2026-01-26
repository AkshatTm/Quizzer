import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getClassroom } from "@/app/actions/classroom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { AddStudentDialog } from "@/components/classroom/add-student-dialog";
import { StudentTable } from "@/components/classroom/student-table";

interface ClassroomPageProps {
    params: Promise<{ id: string }>;
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const { id } = await params;
    const classroom = await getClassroom(id);

    if (!classroom) notFound();

    return (
        <main className="min-h-screen p-6 md:p-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif font-bold">{classroom.name}</h1>
                        {classroom.description && (
                            <p className="text-muted-foreground">{classroom.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/classroom/${id}/quiz/create`}>
                        <Button className="btn-juicy gap-2">
                            <BookOpen className="w-4 h-4" />
                            Create Quiz
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-tile-lavender/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{classroom.students.length}</p>
                                <p className="text-sm text-muted-foreground">Students</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-tile-mint/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-full">
                                <BookOpen className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{classroom.assignments.length}</p>
                                <p className="text-sm text-muted-foreground">Assignments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-tile-butter/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-full">
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                    Active
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Classroom Status</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Students Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-serif">Students</CardTitle>
                        <CardDescription>
                            Manage students and their access IDs
                        </CardDescription>
                    </div>
                    <AddStudentDialog classroomId={id} />
                </CardHeader>
                <CardContent>
                    <StudentTable students={classroom.students} classroomId={id} />
                </CardContent>
            </Card>
        </main>
    );
}
