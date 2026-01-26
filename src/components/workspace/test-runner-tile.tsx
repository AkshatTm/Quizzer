"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";

export interface TestResult {
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    passed?: boolean;
    isHidden?: boolean;
}

interface TestRunnerTileProps {
    testResults: TestResult[];
    status: "idle" | "running" | "done";
    passedCount?: number;
    totalCount?: number;
}

export function TestRunnerTile({ testResults, status, passedCount = 0, totalCount = 0 }: TestRunnerTileProps) {
    const getStatusColor = () => {
        if (status === "idle") return "traffic-idle";
        if (status === "running") return "traffic-running";
        if (passedCount === totalCount && totalCount > 0) return "traffic-pass";
        return "traffic-fail";
    };

    return (
        <Card className={`h-full ${getStatusColor()} transition-colors duration-300`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg">Test Results</CardTitle>
                    {status === "done" && totalCount > 0 && (
                        <Badge variant={passedCount === totalCount ? "default" : "destructive"}>
                            {passedCount}/{totalCount} Passed
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {status === "idle" && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Circle className="w-5 h-5 mr-2" />
                        Ready to run tests
                    </div>
                )}

                {status === "running" && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600 mr-2" />
                        <span className="text-amber-800">Running tests...</span>
                    </div>
                )}

                {status === "done" && (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {testResults.map((result, idx) => (
                            <div
                                key={idx}
                                className={`p-2 rounded text-sm flex items-start gap-2 ${result.isHidden
                                        ? "bg-muted/30"
                                        : result.passed
                                            ? "bg-emerald-50"
                                            : "bg-red-50"
                                    }`}
                            >
                                {result.isHidden ? (
                                    <Circle className="w-4 h-4 text-muted-foreground mt-0.5" />
                                ) : result.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium">
                                        Test {idx + 1}
                                        {result.isHidden && " (Hidden)"}
                                    </span>
                                    {!result.isHidden && !result.passed && result.actualOutput !== undefined && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Expected: <code>{result.expectedOutput}</code>
                                            <br />
                                            Got: <code>{result.actualOutput}</code>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
