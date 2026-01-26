import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClassrooms } from "@/app/actions/classroom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Flag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateClassroomDialog } from "@/components/classroom/create-classroom-dialog";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const isTeacher = (session.user as { role?: string })?.role === "TEACHER" ||
        !session.user?.email?.endsWith("@student.local");

    // Fetch classrooms for teachers
    const classrooms = isTeacher ? await getClassrooms() : [];

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
                                    {classrooms.reduce((acc, c) => acc + c.assignments.length, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total assignments</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-tile-butter/30 border-tile-butter">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2">
                                    <Flag className="w-5 h-5" />
                                    Dispute Inbox
                                </CardTitle>
                                <CardDescription>Review flagged questions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Pending disputes</p>
                            </CardContent>
                        </Card>
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
                                {classrooms.map((classroom) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-tile-lavender/30 border-tile-lavender">
                        <CardHeader>
                            <CardTitle className="font-serif">Active Assignments</CardTitle>
                            <CardDescription>Quizzes waiting for you</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground">Pending assignments</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-tile-mint/30 border-tile-mint">
                        <CardHeader>
                            <CardTitle className="font-serif">Performance</CardTitle>
                            <CardDescription>Your learning progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">—</p>
                            <p className="text-sm text-muted-foreground">Average score</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
    );
}
