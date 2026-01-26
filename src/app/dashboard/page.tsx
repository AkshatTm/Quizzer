import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const isTeacher = (session.user as { role?: string })?.role === "TEACHER" ||
        !session.user?.email?.endsWith("@student.local");

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

            {/* Dashboard Grid */}
            {isTeacher ? (
                // Teacher Dashboard
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-tile-lavender/30 border-tile-lavender">
                        <CardHeader>
                            <CardTitle className="font-serif">My Classrooms</CardTitle>
                            <CardDescription>Manage your classes and students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground">Active classrooms</p>
                            <Button className="mt-4 btn-juicy w-full">Create Classroom</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-tile-mint/30 border-tile-mint">
                        <CardHeader>
                            <CardTitle className="font-serif">My Quizzes</CardTitle>
                            <CardDescription>Create and manage assessments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground">Published quizzes</p>
                            <Button className="mt-4 btn-juicy w-full">Create Quiz</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-tile-butter/30 border-tile-butter">
                        <CardHeader>
                            <CardTitle className="font-serif">Dispute Inbox</CardTitle>
                            <CardDescription>Review flagged questions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground">Pending disputes</p>
                            <Button variant="outline" className="mt-4 btn-juicy w-full">View All</Button>
                        </CardContent>
                    </Card>
                </div>
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
