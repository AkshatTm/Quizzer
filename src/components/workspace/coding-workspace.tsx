"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { BentoGrid, BentoTile } from "@/components/workspace/bento-grid";
import { CodeEditor } from "@/components/workspace/code-editor";
import { ProblemTile } from "@/components/workspace/problem-tile";
import { TestRunnerTile, TestResult } from "@/components/workspace/test-runner-tile";
import { runTestCases } from "@/app/actions/execute";

interface CodingChallenge {
    problemDescription: string;
    constraints: string[];
    examples: { input: string; output: string; explanation?: string }[];
    starterCode: { [lang: string]: string };
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

interface CodingWorkspaceProps {
    title: string;
    challenge: CodingChallenge;
    allowedLanguages?: string[];
    onSubmit?: (code: string, results: TestResult[]) => void;
}

export function CodingWorkspace({
    title,
    challenge,
    allowedLanguages = ["python"],
    onSubmit,
}: CodingWorkspaceProps) {
    const [language, setLanguage] = useState(allowedLanguages[0] || "python");
    const [code, setCode] = useState(challenge.starterCode[language] || "");
    const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
    const [testResults, setTestResults] = useState<TestResult[]>([]);

    function handleLanguageChange(newLang: string) {
        setLanguage(newLang);
        setCode(challenge.starterCode[newLang] || "");
        setTestResults([]);
        setStatus("idle");
    }

    // Real code execution via Piston API
    async function handleRun(codeToRun: string) {
        setStatus("running");
        setTestResults([]);

        try {
            const results = await runTestCases(codeToRun, language, challenge.testCases);
            setTestResults(results);
        } catch (error) {
            console.error("Execution error:", error);
            // Show error state
            setTestResults([{
                input: "",
                expectedOutput: "",
                actualOutput: "Execution service unavailable. Make sure Piston is running.",
                passed: false,
                isHidden: false,
            }]);
        }

        setStatus("done");
    }

    const passedCount = testResults.filter((r) => r.passed).length;
    const allPassed = passedCount === testResults.length && testResults.length > 0;

    return (
        <div className="min-h-screen p-4 md:p-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-serif font-bold">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        No time limit
                    </div>
                    <Button
                        variant={allPassed ? "default" : "outline"}
                        className="btn-juicy gap-2"
                        disabled={!allPassed}
                        onClick={() => onSubmit?.(code, testResults)}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Submit
                    </Button>
                </div>
            </header>

            {/* Bento Grid - Desktop */}
            <div className="hidden md:block">
                <BentoGrid>
                    {/* Problem Tile (Left, spans 2 rows) */}
                    <BentoTile span="row" className="min-h-0">
                        <ProblemTile
                            title={title}
                            description={challenge.problemDescription}
                            constraints={challenge.constraints}
                            examples={challenge.examples}
                        />
                    </BentoTile>

                    {/* Code Editor (Top Right, large) */}
                    <BentoTile className="min-h-0">
                        <CodeEditor
                            defaultValue={code}
                            language={language}
                            allowedLanguages={allowedLanguages}
                            onLanguageChange={handleLanguageChange}
                            onRun={handleRun}
                            isRunning={status === "running"}
                            onChange={setCode}
                        />
                    </BentoTile>

                    {/* Test Runner (Bottom Right) */}
                    <BentoTile className="min-h-0">
                        <TestRunnerTile
                            testResults={testResults}
                            status={status}
                            passedCount={passedCount}
                            totalCount={testResults.length}
                        />
                    </BentoTile>
                </BentoGrid>
            </div>

            {/* Mobile Stack View */}
            <div className="md:hidden space-y-4">
                <div className="h-[300px]">
                    <ProblemTile
                        title={title}
                        description={challenge.problemDescription}
                        constraints={challenge.constraints}
                        examples={challenge.examples}
                    />
                </div>
                <div className="h-[400px]">
                    <CodeEditor
                        defaultValue={code}
                        language={language}
                        allowedLanguages={allowedLanguages}
                        onLanguageChange={handleLanguageChange}
                        onRun={handleRun}
                        isRunning={status === "running"}
                        onChange={setCode}
                    />
                </div>
                <TestRunnerTile
                    testResults={testResults}
                    status={status}
                    passedCount={passedCount}
                    totalCount={testResults.length}
                />
            </div>
        </div>
    );
}
