"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerTeacher(data: {
    name: string;
    email: string;
    password: string;
}) {
    const { name, email, password } = data;

    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        throw new Error("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "TEACHER",
        },
    });

    return { id: user.id, email: user.email };
}
