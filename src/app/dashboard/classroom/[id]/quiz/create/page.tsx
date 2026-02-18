"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Save, Loader2, GripVertical } from "lucide-react";
import Link from "next/link";
import { createQuiz } from "@/app/actions/quiz";

interface CreateQuizPageProps {
    params: Promise<{ id: string }>;
}

// Types for manual quiz creation
interface MCQQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

const SUPPORTED_LANGUAGES = [
    { id: "python", label: "Python", defaultStarter: "# write your code here\n" },
    { id: "java", label: "Java", defaultStarter: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // write your code here\n    }\n}\n" },
    { id: "cpp", label: "C++", defaultStarter: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // write your code here\n    return 0;\n}\n" },
] as const;

interface CodingChallenge {
    problemDescription: string;
    constraints: string[];
    allowedLanguages: string[];
    starterCode: { [lang: string]: string };
    testCases: TestCase[];
}

interface Flashcard {
    id: string;
    front: string;
    back: string;
    hint: string;
}

export default function CreateQuizPage({ params }: CreateQuizPageProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("mcq");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // MCQ State
    const [mcqTitle, setMcqTitle] = useState("");
    const [mcqDescription, setMcqDescription] = useState("");
    const [questions, setQuestions] = useState<MCQQuestion[]>([
        { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);

    // Coding Challenge State
    const [codingTitle, setCodingTitle] = useState("");
    const [codingDescription, setCodingDescription] = useState("");
    const [codingChallenge, setCodingChallenge] = useState<CodingChallenge>({
        problemDescription: "",
        constraints: [""],
        allowedLanguages: ["python"],
        starterCode: { python: "# write your code here\n" },
        testCases: [{ id: "1", input: "", expectedOutput: "", isHidden: false }]
    });

    // Language toggle for coding challenges
    function toggleLanguage(langId: string) {
        const current = codingChallenge.allowedLanguages;
        const newStarter = { ...codingChallenge.starterCode };
        let newLangs: string[];
        if (current.includes(langId)) {
            // Don't allow removing all languages
            if (current.length <= 1) return;
            newLangs = current.filter(l => l !== langId);
            delete newStarter[langId];
        } else {
            newLangs = [...current, langId];
            const langDef = SUPPORTED_LANGUAGES.find(l => l.id === langId);
            newStarter[langId] = langDef?.defaultStarter || "";
        }
        setCodingChallenge({ ...codingChallenge, allowedLanguages: newLangs, starterCode: newStarter });
    }

    function updateStarterCode(langId: string, value: string) {
        setCodingChallenge({
            ...codingChallenge,
            starterCode: { ...codingChallenge.starterCode, [langId]: value }
        });
    }

    // Flashcard State
    const [flashcardTitle, setFlashcardTitle] = useState("");
    const [flashcardDescription, setFlashcardDescription] = useState("");
    const [flashcards, setFlashcards] = useState<Flashcard[]>([
        { id: "1", front: "", back: "", hint: "" }
    ]);

    // MCQ Functions
    function addQuestion() {
        setQuestions([
            ...questions,
            { id: Date.now().toString(), question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
        ]);
    }

    function removeQuestion(id: string) {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id));
        }
    }

    function updateQuestion(id: string, field: keyof MCQQuestion, value: string | number | string[]) {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    }

    function updateOption(questionId: string, optionIndex: number, value: string) {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    }

    // Coding Challenge Functions
    function addTestCase() {
        setCodingChallenge({
            ...codingChallenge,
            testCases: [
                ...codingChallenge.testCases,
                { id: Date.now().toString(), input: "", expectedOutput: "", isHidden: false }
            ]
        });
    }

    function removeTestCase(id: string) {
        if (codingChallenge.testCases.length > 1) {
            setCodingChallenge({
                ...codingChallenge,
                testCases: codingChallenge.testCases.filter(tc => tc.id !== id)
            });
        }
    }

    function updateTestCase(id: string, field: keyof TestCase, value: string | boolean) {
        setCodingChallenge({
            ...codingChallenge,
            testCases: codingChallenge.testCases.map(tc =>
                tc.id === id ? { ...tc, [field]: value } : tc
            )
        });
    }

    function addConstraint() {
        setCodingChallenge({
            ...codingChallenge,
            constraints: [...codingChallenge.constraints, ""]
        });
    }

    function updateConstraint(index: number, value: string) {
        const newConstraints = [...codingChallenge.constraints];
        newConstraints[index] = value;
        setCodingChallenge({ ...codingChallenge, constraints: newConstraints });
    }

    function removeConstraint(index: number) {
        if (codingChallenge.constraints.length > 1) {
            setCodingChallenge({
                ...codingChallenge,
                constraints: codingChallenge.constraints.filter((_, i) => i !== index)
            });
        }
    }

    // Flashcard Functions
    function addFlashcard() {
        setFlashcards([
            ...flashcards,
            { id: Date.now().toString(), front: "", back: "", hint: "" }
        ]);
    }

    function removeFlashcard(id: string) {
        if (flashcards.length > 1) {
            setFlashcards(flashcards.filter(f => f.id !== id));
        }
    }

    function updateFlashcard(id: string, field: keyof Flashcard, value: string) {
        setFlashcards(flashcards.map(f => f.id === id ? { ...f, [field]: value } : f));
    }

    // Save Functions
    async function handleSaveMCQ() {
        if (!mcqTitle.trim()) {
            setError("Please enter a quiz title");
            return;
        }
        if (questions.some(q => !q.question.trim())) {
            setError("Please fill in all question fields");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const content = {
                title: mcqTitle,
                description: mcqDescription,
                type: "STANDARD" as const,
                questions: questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                }))
            };

            await createQuiz({
                title: mcqTitle,
                description: mcqDescription,
                type: "STANDARD",
                content: JSON.stringify(content),
            });

            const { id } = await params;
            router.push(`/dashboard/classroom/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveCoding() {
        if (!codingTitle.trim()) {
            setError("Please enter a challenge title");
            return;
        }
        if (!codingChallenge.problemDescription.trim()) {
            setError("Please enter a problem description");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const content = {
                title: codingTitle,
                description: codingDescription,
                type: "CODING" as const,
                codingChallenge: {
                    problemDescription: codingChallenge.problemDescription,
                    constraints: codingChallenge.constraints.filter(c => c.trim()),
                    examples: codingChallenge.testCases
                        .filter(tc => !tc.isHidden)
                        .map(tc => ({ input: tc.input, output: tc.expectedOutput })),
                    allowedLanguages: codingChallenge.allowedLanguages,
                    starterCode: codingChallenge.starterCode,
                    testCases: codingChallenge.testCases.map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        isHidden: tc.isHidden
                    }))
                }
            };

            await createQuiz({
                title: codingTitle,
                description: codingDescription,
                type: "CODING",
                content: JSON.stringify(content),
            });

            const { id } = await params;
            router.push(`/dashboard/classroom/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save challenge");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveFlashcards() {
        if (!flashcardTitle.trim()) {
            setError("Please enter a deck title");
            return;
        }
        if (flashcards.some(f => !f.front.trim() || !f.back.trim())) {
            setError("Please fill in front and back for all cards");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const content = {
                title: flashcardTitle,
                description: flashcardDescription,
                type: "FLASHCARD" as const,
                flashcards: flashcards.map(f => ({
                    front: f.front,
                    back: f.back,
                    hint: f.hint || undefined,
                }))
            };

            await createQuiz({
                title: flashcardTitle,
                description: flashcardDescription,
                type: "FLASHCARD",
                content: JSON.stringify(content),
            });

            const { id } = await params;
            router.push(`/dashboard/classroom/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save flashcard deck");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="min-h-screen p-6 md:p-12">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold">Create Assessment</h1>
                    <p className="text-muted-foreground">Build your quiz or coding challenge manually</p>
                </div>
            </header>

            {error && (
                <div className="max-w-4xl mx-auto mb-6">
                    <p className="text-destructive text-center bg-destructive/10 rounded-lg p-3">{error}</p>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="mcq" className="text-lg py-3">
                            📝 Standard Quiz
                        </TabsTrigger>
                        <TabsTrigger value="coding" className="text-lg py-3">
                            💻 Coding Challenge
                        </TabsTrigger>
                        <TabsTrigger value="flashcard" className="text-lg py-3">
                            🃏 Flashcards
                        </TabsTrigger>
                    </TabsList>

                    {/* MCQ Tab */}
                    <TabsContent value="mcq" className="space-y-6">
                        {/* Quiz Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Quiz Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mcq-title">Quiz Title *</Label>
                                    <Input
                                        id="mcq-title"
                                        placeholder="e.g., Python Basics Quiz"
                                        value={mcqTitle}
                                        onChange={(e) => setMcqTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mcq-description">Description (optional)</Label>
                                    <Textarea
                                        id="mcq-description"
                                        placeholder="Brief description of the quiz..."
                                        value={mcqDescription}
                                        onChange={(e) => setMcqDescription(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Questions */}
                        {questions.map((q, qIndex) => (
                            <Card key={q.id} className="relative">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                                        <CardTitle className="font-serif text-lg">Question {qIndex + 1}</CardTitle>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuestion(q.id)}
                                        disabled={questions.length === 1}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Question Text *</Label>
                                        <Textarea
                                            placeholder="Enter your question..."
                                            value={q.question}
                                            onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Options (select correct answer)</Label>
                                        {q.options.map((option, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`correct-${q.id}`}
                                                    checked={q.correctAnswer === optIndex}
                                                    onChange={() => updateQuestion(q.id, "correctAnswer", optIndex)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <span className="font-medium text-muted-foreground w-6">
                                                    {String.fromCharCode(65 + optIndex)}.
                                                </span>
                                                <Input
                                                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                    value={option}
                                                    onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                                    className={q.correctAnswer === optIndex ? "border-green-500 bg-green-50" : ""}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Explanation (optional)</Label>
                                        <Textarea
                                            placeholder="Explain why the correct answer is correct..."
                                            value={q.explanation}
                                            onChange={(e) => updateQuestion(q.id, "explanation", e.target.value)}
                                            className="min-h-[60px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={addQuestion} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Question
                            </Button>
                            <Button onClick={handleSaveMCQ} disabled={isSaving} className="btn-juicy gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Quiz
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Coding Challenge Tab */}
                    <TabsContent value="coding" className="space-y-6">
                        {/* Challenge Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Challenge Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="coding-title">Challenge Title *</Label>
                                    <Input
                                        id="coding-title"
                                        placeholder="e.g., Two Sum Problem"
                                        value={codingTitle}
                                        onChange={(e) => setCodingTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coding-description">Short Description (optional)</Label>
                                    <Input
                                        id="coding-description"
                                        placeholder="Brief one-liner about the challenge..."
                                        value={codingDescription}
                                        onChange={(e) => setCodingDescription(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Problem Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Problem Description *</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Describe the problem in detail. You can use markdown formatting..."
                                    value={codingChallenge.problemDescription}
                                    onChange={(e) => setCodingChallenge({ ...codingChallenge, problemDescription: e.target.value })}
                                    className="min-h-[200px] font-mono text-sm"
                                />
                            </CardContent>
                        </Card>

                        {/* Constraints */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Constraints</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {codingChallenge.constraints.map((constraint, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="e.g., 1 <= n <= 10^5"
                                            value={constraint}
                                            onChange={(e) => updateConstraint(index, e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeConstraint(index)}
                                            disabled={codingChallenge.constraints.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addConstraint} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Constraint
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Language Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Allowed Languages</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">Select which languages students can use. At least one must be selected.</p>
                                <div className="flex gap-4">
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <label key={lang.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={codingChallenge.allowedLanguages.includes(lang.id)}
                                                onChange={() => toggleLanguage(lang.id)}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <span className="font-medium">{lang.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Per-Language Starter Code */}
                        {codingChallenge.allowedLanguages.map(langId => {
                            const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
                            return (
                                <Card key={langId}>
                                    <CardHeader>
                                        <CardTitle className="font-serif">Starter Code ({lang?.label})</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={codingChallenge.starterCode[langId] || ""}
                                            onChange={(e) => updateStarterCode(langId, e.target.value)}
                                            className="min-h-[150px] font-mono text-sm"
                                        />
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Test Cases */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Test Cases</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {codingChallenge.testCases.map((tc, index) => (
                                    <div key={tc.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Test Case {index + 1}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={tc.isHidden}
                                                        onCheckedChange={(checked) => updateTestCase(tc.id, "isHidden", checked)}
                                                    />
                                                    <Label className="text-sm text-muted-foreground">Hidden</Label>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeTestCase(tc.id)}
                                                    disabled={codingChallenge.testCases.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Input</Label>
                                                <Textarea
                                                    placeholder="[1, 2, 3]"
                                                    value={tc.input}
                                                    onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                                                    className="font-mono text-sm min-h-[80px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Expected Output</Label>
                                                <Textarea
                                                    placeholder="6"
                                                    value={tc.expectedOutput}
                                                    onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                                                    className="font-mono text-sm min-h-[80px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" onClick={addTestCase} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Test Case
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button onClick={handleSaveCoding} disabled={isSaving} className="btn-juicy gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Challenge
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Flashcard Tab */}
                    <TabsContent value="flashcard" className="space-y-6">
                        {/* Deck Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-serif">Deck Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fc-title">Deck Title</Label>
                                    <Input
                                        id="fc-title"
                                        placeholder="e.g., Spanish Vocabulary - Unit 3"
                                        value={flashcardTitle}
                                        onChange={(e) => setFlashcardTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fc-desc">Description (optional)</Label>
                                    <Textarea
                                        id="fc-desc"
                                        placeholder="What are these flashcards about?"
                                        value={flashcardDescription}
                                        onChange={(e) => setFlashcardDescription(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Flashcards */}
                        {flashcards.map((card, idx) => (
                            <Card key={card.id}>
                                <CardHeader className="flex flex-row items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                        <CardTitle className="text-base font-serif">Card {idx + 1}</CardTitle>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFlashcard(card.id)}
                                        disabled={flashcards.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Front (Term / Question)</Label>
                                            <Textarea
                                                placeholder="e.g., ¿Cómo te llamas?"
                                                value={card.front}
                                                onChange={(e) => updateFlashcard(card.id, "front", e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Back (Answer / Definition)</Label>
                                            <Textarea
                                                placeholder="e.g., What is your name?"
                                                value={card.back}
                                                onChange={(e) => updateFlashcard(card.id, "back", e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hint (optional)</Label>
                                        <Input
                                            placeholder="e.g., Think about introductions"
                                            value={card.hint}
                                            onChange={(e) => updateFlashcard(card.id, "hint", e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button variant="outline" onClick={addFlashcard} className="w-full gap-2">
                            <Plus className="w-4 h-4" />
                            Add Card
                        </Button>

                        <div className="flex justify-end">
                            <Button onClick={handleSaveFlashcards} disabled={isSaving} className="btn-juicy gap-2">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Flashcard Deck
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
