"use server";

function getPistonUrl() {
    return process.env.PISTON_URL || "http://127.0.0.1:2000";
}

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

interface ExecuteResult {
    success: boolean;
    output: string;
    error: string | null;
    exitCode: number | null;
}

interface TestCaseResult {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    isHidden: boolean;
}

export async function executeCode(
    code: string,
    language: string,
    stdin: string = ""
): Promise<ExecuteResult> {
    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!langConfig) {
        return {
            success: false,
            output: "",
            error: `Unsupported language: ${language}`,
            exitCode: null,
        };
    }

    try {
        const pistonUrl = `${PISTON_URL}/api/v2/execute`;
        console.log("[execute] Calling Piston directly at:", pistonUrl);

        const response = await fetch(pistonUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: langConfig.language,
                version: langConfig.version,
                files: [{ content: code }],
                stdin,
                args: [],
                compile_timeout: 10000,
                run_timeout: 5000,
                compile_memory_limit: 256000000,
                run_memory_limit: 256000000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[execute] Piston error:", response.status, errorText);
            return {
                success: false,
                output: "",
                error: `Code execution service unavailable (${response.status})`,
                exitCode: null,
            };
        }

        const result = await response.json();

        // Check for compile errors
        if (result.compile && result.compile.stderr) {
            return {
                success: false,
                output: result.compile.stderr,
                error: "Compilation error",
                exitCode: result.compile.code,
            };
        }

        return {
            success: result.run.code === 0,
            output: result.run.stdout || result.run.output || "",
            error: result.run.stderr || null,
            exitCode: result.run.code,
        };
    } catch (error) {
        console.error("[execute] Failed to reach Piston:", error);
        return {
            success: false,
            output: "",
            error: `Cannot reach code execution service at ${PISTON_URL}`,
            exitCode: null,
        };
    }
}

export async function runTestCases(
    code: string,
    language: string,
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[]
): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
        const result = await executeCode(code, language, testCase.input);

        // Normalize outputs for comparison (trim whitespace)
        const actualOutput = (result.output || result.error || "").trim();
        const expectedOutput = testCase.expectedOutput.trim();

        results.push({
            input: testCase.input,
            expectedOutput,
            actualOutput,
            passed: result.success && actualOutput === expectedOutput,
            isHidden: testCase.isHidden,
        });
    }

    return results;
}

export async function checkPistonAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${PISTON_URL}/api/v2/runtimes`);
        return response.ok;
    } catch {
        return false;
    }
}
