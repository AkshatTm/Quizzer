"use client";

import { useState, useCallback, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

const LANGUAGE_LABELS: { [key: string]: string } = {
    python: "Python",
    java: "Java",
    cpp: "C++",
};

// Monaco uses different language identifiers than our internal IDs
const MONACO_LANGUAGE_MAP: { [key: string]: string } = {
    python: "python",
    java: "java",
    cpp: "cpp",
};

interface CodeEditorProps {
    defaultValue?: string;
    language?: string;
    allowedLanguages?: string[];
    onLanguageChange?: (lang: string) => void;
    onRun?: (code: string) => void;
    isRunning?: boolean;
    onChange?: (value: string) => void;
}

export function CodeEditor({
    defaultValue = "",
    language = "python",
    allowedLanguages = ["python"],
    onLanguageChange,
    onRun,
    isRunning = false,
    onChange,
}: CodeEditorProps) {
    const [code, setCode] = useState(defaultValue);

    // Sync defaultValue when language changes
    useEffect(() => {
        setCode(defaultValue);
    }, [defaultValue]);

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

    const monacoLang = MONACO_LANGUAGE_MAP[language] || language;

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden border bg-[#f8f9fa]">
            {/* Language selector header */}
            {allowedLanguages.length > 1 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
                    <span className="text-xs font-medium text-muted-foreground">Language:</span>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange?.(e.target.value)}
                        className="text-sm font-medium bg-background border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        {allowedLanguages.map(lang => (
                            <option key={lang} value={lang}>
                                {LANGUAGE_LABELS[lang] || lang}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <Editor
                height={allowedLanguages.length > 1 ? "calc(100% - 40px)" : "100%"}
                language={monacoLang}
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
