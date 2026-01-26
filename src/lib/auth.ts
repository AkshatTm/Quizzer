import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        // Teacher authentication via Google OAuth
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

                // Return a user-like object for the session
                return {
                    id: student.id,
                    name: student.name,
                    email: `${student.accessId}@student.local`,
                    role: "STUDENT",
                    classroomId: student.classroomId,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
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
