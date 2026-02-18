import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClassrooms } from "@/app/actions/classroom";
import { getStudentAssignments, getStudentSubmissions } from "@/app/actions/quiz";
import { getDisputes } from "@/app/actions/dispute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Flag, ChevronRight, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { CreateClassroomDialog } from "@/components/classroom/create-classroom-dialog";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const isTeacher = (session.user as { role?: string })?.role === "TEACHER" ||
        !session.user?.email?.endsWith("@student.local");

    // Fetch data based on role
    const classrooms = isTeacher ? await getClassrooms() : [];
    const disputes = isTeacher ? await getDisputes() : [];
    const pendingDisputes = disputes.filter((d: { status: string }) => d.status === "PENDING");

    // Student-specific data
    const studentAssignments = !isTeacher ? await getStudentAssignments() : [];
    const studentSubmissions = !isTeacher ? await getStudentSubmissions() : [];
    const pendingAssignments = studentAssignments.filter(
        (a: { submissions: unknown[] }) => a.submissions.length === 0
    );
    const avgScore = studentSubmissions.length > 0
        ? Math.round(
            studentSubmissions.reduce(
                (acc: number, s: { score: number | null; maxScore: number | null }) =>
                    acc + ((s.score || 0) / (s.maxScore || 1)) * 100,
                0
            ) / studentSubmissions.length
        )
        : null;

    return (
        <main className="min-h-screen p-6 md:p-12">
            {/* Header */}
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-serif font-bold">
                        <span className="text-primary">Code</span>Canvas
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-xs">
                        {isTeacher ? "Teacher" : "Student"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        {session.user?.name || session.user?.email}
                    </span>
                    <form action={async () => {
                        "use server";
                        const { signOut } = await import("@/lib/auth");
                        await signOut({ redirectTo: "/" });
                    }}>
                        <Button variant="outline" size="sm" type="submit">
                            Sign out
                        </Button>
                    </form>
                </div>
            </header>

            {/* Welcome */}
            <div className="mb-12">
                <h2 className="text-2xl font-serif font-semibold mb-2">
                    Welcome back, {session.user?.name?.split(" ")[0] || "User"}!
                </h2>
                <p className="text-muted-foreground">
                    {isTeacher
                        ? "Manage your classrooms and create engaging quizzes."
                        : "View your assignments and continue learning."
                    }
                </p>
            </div>

            {/* Dashboard Content */}
            {isTeacher ? (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="bg-tile-lavender/30 border-tile-lavender">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    My Classrooms
                                </CardTitle>
                                <CardDescription>Manage your classes and students</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{classrooms.length}</p>
                                <p className="text-sm text-muted-foreground">Active classrooms</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-tile-mint/30 border-tile-mint">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    My Quizzes
                                </CardTitle>
                                <CardDescription>Create and manage assessments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {classrooms.reduce((acc: number, c: { assignments: unknown[] }) => acc + c.assignments.length, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total assignments</p>
                            </CardContent>
                        </Card>

                        <Link href="/dashboard/disputes">
                            <Card className="bg-tile-butter/30 border-tile-butter hover:border-primary/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="font-serif flex items-center gap-2">
                                        <Flag className="w-5 h-5" />
                                        Dispute Inbox
                                    </CardTitle>
                                    <CardDescription>Review flagged questions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{pendingDisputes.length}</p>
                                    <p className="text-sm text-muted-foreground">Pending disputes</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Classrooms List */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-serif font-semibold">Your Classrooms</h3>
                            <CreateClassroomDialog />
                        </div>

                        {classrooms.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <h4 className="text-lg font-semibold mb-2">No classrooms yet</h4>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first classroom to start adding students and quizzes.
                                    </p>
                                    <CreateClassroomDialog />
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {classrooms.map((classroom: {
                                    id: string;
                                    name: string;
                                    description: string | null;
                                    students: unknown[];
                                    assignments: unknown[];
                                }) => (
                                    <Link key={classroom.id} href={`/dashboard/classroom/${classroom.id}`}>
                                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                            <CardHeader>
                                                <CardTitle className="font-serif flex items-center justify-between">
                                                    {classroom.name}
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                                </CardTitle>
                                                {classroom.description && (
                                                    <CardDescription className="line-clamp-2">
                                                        {classroom.description}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {classroom.students.length} students
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="w-4 h-4" />
                                                        {classroom.assignments.length} quizzes
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                // Student Dashboard
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="bg-tile-lavender/30 border-tile-lavender">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Pending
                                </CardTitle>
                                <CardDescription>Assignments waiting for you</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{pendingAssignments.length}</p>
                                <p className="text-sm text-muted-foreground">To complete</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-tile-mint/30 border-tile-mint">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Completed
                                </CardTitle>
                                <CardDescription>Quizzes you&apos;ve finished</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{studentSubmissions.length}</p>
                                <p className="text-sm text-muted-foreground">Submissions</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-tile-butter/30 border-tile-butter">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Performance
                                </CardTitle>
                                <CardDescription>Your average score</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{avgScore !== null ? `${avgScore}%` : "—"}</p>
                                <p className="text-sm text-muted-foreground">Average score</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Assignments */}
                    <div className="mb-8">
                        <h3 className="text-xl font-serif font-semibold mb-6">Your Assignments</h3>

                        {studentAssignments.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <h4 className="text-lg font-semibold mb-2">No assignments yet</h4>
                                    <p className="text-muted-foreground">
                                        Your teacher hasn&apos;t assigned any quizzes to your class yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {studentAssignments.map((assignment: {
                                    id: string;
                                    deadline: Date | null;
                                    quiz: { id: string; title: string; description: string | null; type: string };
                                    submissions: unknown[];
                                }) => {
                                    const isCompleted = assignment.submissions.length > 0;
                                    const quizUrl = assignment.quiz.type === "FLASHCARD"
                                        ? `/quiz/${assignment.quiz.id}/flashcards`
                                        : `/quiz/${assignment.quiz.id}`;

                                    return (
                                        <Link key={assignment.id} href={quizUrl}>
                                            <Card className={`hover:border-primary/50 transition-colors cursor-pointer h-full ${isCompleted ? "opacity-75" : ""}`}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="font-serif text-lg">
                                                            {assignment.quiz.title}
                                                        </CardTitle>
                                                        <Badge variant={isCompleted ? "secondary" : "default"}>
                                                            {isCompleted ? "Done" : assignment.quiz.type}
                                                        </Badge>
                                                    </div>
                                                    {assignment.quiz.description && (
                                                        <CardDescription className="line-clamp-2">
                                                            {assignment.quiz.description}
                                                        </CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {assignment.deadline && (
                                                            <>
                                                                <Clock className="w-4 h-4" />
                                                                Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                            </>
                                                        )}
                                                        {isCompleted && (
                                                            <span className="text-emerald-600 flex items-center gap-1">
                                                                <Trophy className="w-4 h-4" /> Submitted
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Past Submissions */}
                    {studentSubmissions.length > 0 && (
                        <div>
                            <h3 className="text-xl font-serif font-semibold mb-6">Past Submissions</h3>
                            <div className="space-y-3">
                                {studentSubmissions.map((sub: {
                                    id: string;
                                    score: number | null;
                                    maxScore: number | null;
                                    submittedAt: Date;
                                    assignment: { quiz: { title: string; type: string } };
                                }) => (
                                    <Card key={sub.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{sub.assignment.quiz.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(sub.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    {sub.score !== null ? `${sub.score}/${sub.maxScore}` : "—"}
                                                </p>
                                                <Badge variant="outline" className="text-xs">
                                                    {sub.assignment.quiz.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
