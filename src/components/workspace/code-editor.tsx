"use client";

import { useState, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

interface CodeEditorProps {
    defaultValue?: string;
    language?: string;
    onRun?: (code: string) => void;
    isRunning?: boolean;
    onChange?: (value: string) => void;
}

export function CodeEditor({
    defaultValue = "",
    language = "python",
    onRun,
    isRunning = false,
    onChange,
}: CodeEditorProps) {
    const [code, setCode] = useState(defaultValue);

    const handleEditorDidMount: OnMount = (editor) => {
        // Focus editor on mount
        editor.focus();
    };

    const handleChange = useCallback((value: string | undefined) => {
        const newCode = value || "";
        setCode(newCode);
        onChange?.(newCode);
    }, [onChange]);

    const handleRun = () => {
        onRun?.(code);
    };

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden border bg-[#f8f9fa]">
            <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleChange}
                onMount={handleEditorDidMount}
                theme="vs-light"
                options={{
                    fontSize: 14,
                    fontFamily: "var(--font-fira-code), Fira Code, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    lineNumbersMinChars: 3,
                    padding: { top: 16, bottom: 16 },
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: "on",
                    scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                }}
            />

            {/* Floating Run Button */}
            <Button
                onClick={handleRun}
                disabled={isRunning || !code.trim()}
                className="absolute bottom-4 right-4 btn-juicy gap-2 shadow-lg"
                size="lg"
            >
                {isRunning ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                    </>
                ) : (
                    <>
                        <Play className="w-4 h-4" />
                        Run Code
                    </>
                )}
            </Button>
        </div>
    );
}
