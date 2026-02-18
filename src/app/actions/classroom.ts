"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// Generate a unique, non-guessable access ID for students
function generateAccessId(): string {
    return nanoid(10).toUpperCase();
}

// ============================================
// CLASSROOM ACTIONS
// ============================================

export async function createClassroom(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;

    const classroom = await prisma.classroom.create({
        data: {
            name,
            description,
            teacherId: session.user.id,
        },
    });

    revalidatePath("/dashboard");
    return classroom;
}

export async function getClassrooms() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.classroom.findMany({
        where: { teacherId: session.user.id },
        include: {
            students: true,
            assignments: {
                include: { quiz: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getClassroom(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    return prisma.classroom.findFirst({
        where: { id, teacherId: session.user.id },
        include: {
            students: true,
            assignments: {
                include: { quiz: true },
            },
        },
    });
}

export async function deleteClassroom(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.classroom.delete({
        where: { id, teacherId: session.user.id },
    });

    revalidatePath("/dashboard");
}

// ============================================
// STUDENT ACTIONS
// ============================================

export async function addStudent(classroomId: string, name: string, customAccessId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
        where: { id: classroomId, teacherId: session.user.id },
    });
    if (!classroom) throw new Error("Classroom not found");

    // Use custom access ID or generate one
    const accessId = customAccessId?.trim() || generateAccessId();

    // Validate uniqueness if custom
    if (customAccessId?.trim()) {
        const existing = await prisma.student.findUnique({ where: { accessId } });
        if (existing) throw new Error(`Access ID "${accessId}" is already taken`);
    }

    const student = await prisma.student.create({
        data: {
            name,
            accessId,
            classroomId,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/classroom/${classroomId}`);
    return student;
}

export async function addMultipleStudents(
    classroomId: string,
    entries: { name: string; accessId?: string }[]
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const classroom = await prisma.classroom.findFirst({
        where: { id: classroomId, teacherId: session.user.id },
    });
    if (!classroom) throw new Error("Classroom not found");

    // Collect custom IDs to check for duplicates within the batch
    const customIds = entries
        .map(e => e.accessId?.trim())
        .filter((id): id is string => !!id);
    const uniqueCustomIds = new Set(customIds);
    if (customIds.length !== uniqueCustomIds.size) {
        throw new Error("Duplicate Access IDs found in the batch");
    }

    // Check existing access IDs in DB
    if (customIds.length > 0) {
        const existing = await prisma.student.findMany({
            where: { accessId: { in: customIds } },
            select: { accessId: true },
        });
        if (existing.length > 0) {
            throw new Error(`Access ID(s) already taken: ${existing.map(e => e.accessId).join(", ")}`);
        }
    }

    const students = await prisma.student.createMany({
        data: entries.map(entry => ({
            name: entry.name,
            accessId: entry.accessId?.trim() || generateAccessId(),
            classroomId,
        })),
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/classroom/${classroomId}`);
    return students;
}

export async function regenerateAccessId(studentId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership through classroom
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { classroom: true },
    });

    if (!student || student.classroom.teacherId !== session.user.id) {
        throw new Error("Student not found");
    }

    const updated = await prisma.student.update({
        where: { id: studentId },
        data: { accessId: generateAccessId() },
    });

    revalidatePath(`/dashboard/classroom/${student.classroomId}`);
    return updated;
}

export async function removeStudent(studentId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { classroom: true },
    });

    if (!student || student.classroom.teacherId !== session.user.id) {
        throw new Error("Student not found");
    }

    await prisma.student.delete({ where: { id: studentId } });

    revalidatePath(`/dashboard/classroom/${student.classroomId}`);
}
