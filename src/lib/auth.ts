import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        // Teacher authentication via Email/Password
        Credentials({
            id: "teacher-credentials",
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "teacher@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
        // Student authentication via Access ID
        Credentials({
            id: "student-access",
            name: "Student Access",
            credentials: {
                accessId: { label: "Access ID", type: "text", placeholder: "Enter your access ID" },
            },
            async authorize(credentials) {
                if (!credentials?.accessId) return null;

                const student = await prisma.student.findUnique({
                    where: { accessId: credentials.accessId as string },
                    include: { classroom: true },
                });

                if (!student) return null;

                return {
                    id: student.id,
                    name: student.name,
                    email: `${student.accessId}@student.local`,
                    role: "STUDENT",
                    classroomId: student.classroomId,
                };
            },
        }),
        // Google OAuth for teachers
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    logger: {
        // Suppress JWTSessionError console.error logs (caused by stale cookies
        // when AUTH_SECRET changes). Auth.js already handles this gracefully by
        // returning null for the session — the console.error is just noise.
        error: (error) => {
            // Check error.name (standard Error), error.type (AuthError subclass),
            // and a case-insensitive message check as fallback
            const name = error instanceof Error ? error.name : "";
            const type = (error as { type?: string })?.type || "";
            const message = error instanceof Error ? error.message : String(error);
            if (
                name === "JWTSessionError" ||
                type === "JWTSessionError" ||
                message.toLowerCase().includes("jwtsessionerror") ||
                message.includes("no matching decryption secret")
            ) {
                // Silently ignore — stale cookie, session will be null
                return;
            }
            // Log unexpected auth errors normally
            console.error("[auth] error:", error);
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role || "TEACHER";
                token.classroomId = (user as { classroomId?: string }).classroomId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                (session.user as { role?: string }).role = token.role as string;
                (session.user as { classroomId?: string }).classroomId = token.classroomId as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
});
