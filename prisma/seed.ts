import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Generate a unique 8-character access ID
function generateAccessId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like 0, O, I, 1
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function main() {
    console.log("🌱 Seeding database...\n");

    // Create test teacher with email/password
    const hashedPassword = await bcrypt.hash("teacher123", 10);

    const teacher = await prisma.user.upsert({
        where: { email: "teacher@openquiz.local" },
        update: {},
        create: {
            email: "teacher@openquiz.local",
            password: hashedPassword,
            name: "Demo Teacher",
            role: "TEACHER",
        },
    });
    console.log("✅ Created teacher:", teacher.email);

    // Create a classroom
    const classroom = await prisma.classroom.upsert({
        where: { id: "demo-classroom-1" },
        update: {},
        create: {
            id: "demo-classroom-1",
            name: "Introduction to Programming",
            description: "A beginner-friendly course covering Python basics, data structures, and algorithms.",
            teacherId: teacher.id,
        },
    });
    console.log("✅ Created classroom:", classroom.name);

    // Create 10 students with unique access IDs
    const studentNames = [
        "Alice Johnson",
        "Bob Smith",
        "Charlie Brown",
        "Diana Prince",
        "Edward Elric",
        "Fiona Green",
        "George Wilson",
        "Hannah Baker",
        "Ivan Petrov",
        "Julia Chen",
    ];

    console.log("\n📚 Creating students:\n");
    console.log("┌─────────────────────┬─────────────┐");
    console.log("│ Student Name        │ Access ID   │");
    console.log("├─────────────────────┼─────────────┤");

    const students = [];
    for (const name of studentNames) {
        const accessId = generateAccessId();
        const student = await prisma.student.upsert({
            where: { accessId },
            update: {},
            create: {
                name,
                accessId,
                classroomId: classroom.id,
            },
        });
        students.push(student);
        console.log(`│ ${name.padEnd(19)} │ ${accessId}    │`);
    }
    console.log("└─────────────────────┴─────────────┘");

    console.log("\n✨ Seeding complete!\n");
    console.log("═══════════════════════════════════════════════");
    console.log("                LOGIN CREDENTIALS               ");
    console.log("═══════════════════════════════════════════════");
    console.log("\n🎓 TEACHER LOGIN:");
    console.log("   Email:    teacher@openquiz.local");
    console.log("   Password: teacher123");
    console.log("\n👨‍🎓 STUDENT LOGIN:");
    console.log("   Use any Access ID from the table above");
    console.log("═══════════════════════════════════════════════\n");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
