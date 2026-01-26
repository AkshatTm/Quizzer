"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [accessId, setAccessId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleStudentLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("student-access", {
                accessId,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid access ID. Please check and try again.");
                setIsLoading(false);
            } else {
                // Redirect manually on success
                window.location.href = "/dashboard";
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handleTeacherLogin = () => {
        setIsLoading(true);
        signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-primary">
                        CodeCanvas
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Where coding feels like art
                    </p>
                </div>

                <Tabs defaultValue="student" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student">Student</TabsTrigger>
                        <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    </TabsList>

                    {/* Student Login */}
                    <TabsContent value="student">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Welcome back!</CardTitle>
                                <CardDescription>
                                    Enter your access ID to continue your learning journey.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStudentLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="accessId">Access ID</Label>
                                        <Input
                                            id="accessId"
                                            type="text"
                                            placeholder="Enter your access ID"
                                            value={accessId}
                                            onChange={(e) => setAccessId(e.target.value)}
                                            className="text-lg h-12 text-center tracking-widest font-mono"
                                            required
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-sm text-destructive text-center">{error}</p>
                                    )}
                                    <Button
                                        type="submit"
                                        className="w-full btn-juicy h-12 text-lg"
                                        disabled={isLoading || !accessId}
                                    >
                                        {isLoading ? "Signing in..." : "Enter Classroom"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Teacher Login */}
                    <TabsContent value="teacher">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Teacher Portal</CardTitle>
                                <CardDescription>
                                    Sign in with your Google account to manage your classrooms.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    onClick={handleTeacherLogin}
                                    variant="outline"
                                    className="w-full btn-juicy h-12 text-lg gap-3"
                                    disabled={isLoading}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    {isLoading ? "Signing in..." : "Continue with Google"}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    By signing in, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    OpenQuiz — Open Source Education Platform
                </p>
            </div>
        </div>
    );
}
