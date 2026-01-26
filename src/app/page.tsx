import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
          <span className="text-primary">Code</span>Canvas
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
          Where coding assessments feel like <span className="highlight-marker">creative puzzles</span> rather than exams.
        </p>
        <p className="text-lg text-muted-foreground mb-12">
          An interactive educational platform with gamified learning, coding challenges, and spaced-repetition flashcards.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="btn-juicy text-lg px-8 py-6">
              Get Started
            </Button>
          </Link>
          <a href="https://github.com/AkshatTm/Quizzer" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="btn-juicy text-lg px-8 py-6">
              View on GitHub
            </Button>
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <div className="p-6 rounded-2xl bg-tile-lavender/50 border border-border">
          <div className="text-3xl mb-4">🧩</div>
          <h3 className="text-xl font-serif font-semibold mb-2">Standard Quizzes</h3>
          <p className="text-muted-foreground">
            Create MCQ and short-answer assessments with instant feedback.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-tile-mint/50 border border-border">
          <div className="text-3xl mb-4">💻</div>
          <h3 className="text-xl font-serif font-semibold mb-2">Coding Challenges</h3>
          <p className="text-muted-foreground">
            Run code in a secure sandbox with AI-generated test cases.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-tile-butter/50 border border-border">
          <div className="text-3xl mb-4">🧠</div>
          <h3 className="text-xl font-serif font-semibold mb-2">Spaced Repetition</h3>
          <p className="text-muted-foreground">
            Language flashcards that adapt to your learning pace.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center text-sm text-muted-foreground">
        <p>OpenQuiz — Open Source Education Platform</p>
      </footer>
    </main>
  );
}
