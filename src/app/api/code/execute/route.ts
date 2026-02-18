import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = process.env.PISTON_URL || "http://127.0.0.1:2000";

// Language mappings for Piston
const LANGUAGE_MAP: { [key: string]: { language: string; version: string } } = {
    python: { language: "python", version: "3.10.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    java: { language: "java", version: "15.0.2" },
    cpp: { language: "c++", version: "10.2.0" },
    c: { language: "c", version: "10.2.0" },
    go: { language: "go", version: "1.16.2" },
    rust: { language: "rust", version: "1.68.2" },
};

interface ExecuteRequest {
    code: string;
    language: string;
    stdin?: string;
}

interface PistonResponse {
    run: {
        stdout: string;
        stderr: string;
        output: string;
        code: number | null;
        signal: string | null;
    };
    compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number | null;
        signal: string | null;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: ExecuteRequest = await request.json();
        const { code, language, stdin = "" } = body;

        // Validate language
        const langConfig = LANGUAGE_MAP[language.toLowerCase()];
        if (!langConfig) {
            return NextResponse.json(
                { error: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // Validate code
        if (!code || code.trim().length === 0) {
            return NextResponse.json(
                { error: "No code provided" },
                { status: 400 }
            );
        }

        // Call Piston API
        const pistonUrl = `${PISTON_URL}/api/v2/execute`;
        console.log("[code/execute] Calling Piston at:", pistonUrl, "PISTON_URL env:", process.env.PISTON_URL);

        let pistonResponse: Response;
        try {
            pistonResponse = await fetch(pistonUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: langConfig.language,
                    version: langConfig.version,
                    files: [{ content: code }],
                    stdin,
                    args: [],
                    compile_timeout: 10000, // 10 seconds
                    run_timeout: 5000, // 5 seconds
                    compile_memory_limit: 256000000, // 256MB
                    run_memory_limit: 256000000, // 256MB
                }),
            });
        } catch (fetchError) {
            console.error("[code/execute] Fetch to Piston failed:", fetchError);
            return NextResponse.json(
                { error: `Cannot reach Piston at ${pistonUrl}: ${fetchError}` },
                { status: 503 }
            );
        }

        if (!pistonResponse.ok) {
            const errorText = await pistonResponse.text();
            console.error("[code/execute] Piston returned error:", pistonResponse.status, errorText);
            return NextResponse.json(
                { error: `Code execution service error (${pistonResponse.status}): ${errorText}` },
                { status: 503 }
            );
        }

        const result: PistonResponse = await pistonResponse.json();

        // Check for compile errors
        if (result.compile && result.compile.stderr) {
            return NextResponse.json({
                success: false,
                output: result.compile.stderr,
                error: "Compilation error",
            });
        }

        // Return execution result
        return NextResponse.json({
            success: result.run.code === 0,
            output: result.run.stdout || result.run.output,
            error: result.run.stderr || null,
            exitCode: result.run.code,
        });
    } catch (error) {
        console.error("Execute error:", error);
        return NextResponse.json(
            { error: "Failed to execute code" },
            { status: 500 }
        );
    }
}

// GET: Check available runtimes
export async function GET() {
    try {
        const response = await fetch(`${PISTON_URL}/api/v2/runtimes`);
        if (!response.ok) {
            return NextResponse.json(
                { error: "Piston service unavailable" },
                { status: 503 }
            );
        }
        const runtimes = await response.json();
        return NextResponse.json({ runtimes });
    } catch (error) {
        console.error("Runtimes error:", error);
        return NextResponse.json(
            { error: "Failed to fetch runtimes", available: false },
            { status: 503 }
        );
    }
}
