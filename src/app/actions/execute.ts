"use server";

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/code/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language, stdin }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                output: "",
                error: error.error || "Execution failed",
                exitCode: null,
            };
        }

        return await response.json();
    } catch (error) {
        console.error("Execute code error:", error);
        return {
            success: false,
            output: "",
            error: "Failed to connect to execution service",
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/code/execute`, {
            method: "GET",
        });
        const data = await response.json();
        return data.available !== false;
    } catch {
        return false;
    }
}
