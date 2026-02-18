import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDisputes, resolveDispute } from "@/app/actions/dispute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Flag, Check, X } from "lucide-react";
import Link from "next/link";

export default async function DisputesPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const disputes = await getDisputes();

    async function handleResolve(formData: FormData) {
        "use server";
        const disputeId = formData.get("disputeId") as string;
        const action = formData.get("action") as "APPROVED" | "REJECTED";
        const resolution = formData.get("resolution") as string || (action === "APPROVED" ? "Dispute accepted" : "Dispute rejected");

        await resolveDispute(disputeId, action, resolution);
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
                    <h1 className="text-2xl font-serif font-bold">Dispute Inbox</h1>
                    <p className="text-muted-foreground">
                        Review flagged questions from students
                    </p>
                </div>
            </header>

            {disputes.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-semibold mb-2">No disputes</h4>
                        <p className="text-muted-foreground">
                            No students have flagged any questions yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {disputes.map((dispute: {
                        id: string;
                        questionIdx: number;
                        comment: string;
                        status: string;
                        resolution: string | null;
                        createdAt: Date;
                        resolvedAt: Date | null;
                        quiz: { title: string; content: string };
                    }) => {
                        const isPending = dispute.status === "PENDING";
                        let questionText = "";
                        try {
                            const content = JSON.parse(dispute.quiz.content);
                            questionText = content.questions?.[dispute.questionIdx]?.question || "";
                        } catch { /* ignore */ }

                        return (
                            <Card key={dispute.id} className={isPending ? "border-amber-300" : ""}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="font-serif text-lg flex items-center gap-2">
                                                <Flag className={`w-4 h-4 ${isPending ? "text-amber-500" : "text-muted-foreground"}`} />
                                                {dispute.quiz.title} — Q{dispute.questionIdx + 1}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {new Date(dispute.createdAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={
                                            dispute.status === "APPROVED"
                                                ? "default"
                                                : dispute.status === "REJECTED"
                                                    ? "destructive"
                                                    : "secondary"
                                        }>
                                            {dispute.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {questionText && (
                                        <p className="text-sm text-muted-foreground mb-2 italic">
                                            &quot;{questionText}&quot;
                                        </p>
                                    )}
                                    <p className="mb-4 p-3 bg-muted rounded-lg text-sm">
                                        💬 {dispute.comment}
                                    </p>

                                    {dispute.resolution && (
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Resolution: {dispute.resolution}
                                        </p>
                                    )}

                                    {isPending && (
                                        <div className="flex gap-2">
                                            <form action={handleResolve}>
                                                <input type="hidden" name="disputeId" value={dispute.id} />
                                                <input type="hidden" name="action" value="APPROVED" />
                                                <input type="hidden" name="resolution" value="Question accepted as disputed — points awarded" />
                                                <Button type="submit" variant="default" size="sm" className="gap-1">
                                                    <Check className="w-4 h-4" />
                                                    Accept
                                                </Button>
                                            </form>
                                            <form action={handleResolve}>
                                                <input type="hidden" name="disputeId" value={dispute.id} />
                                                <input type="hidden" name="action" value="REJECTED" />
                                                <input type="hidden" name="resolution" value="Dispute reviewed — original answer stands" />
                                                <Button type="submit" variant="outline" size="sm" className="gap-1">
                                                    <X className="w-4 h-4" />
                                                    Reject
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
