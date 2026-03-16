"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    async function loadProposals() {
        try {
            const userRaw = localStorage.getItem("user");
            if (!userRaw) return;
            const user = JSON.parse(userRaw);

            const res = await fetch(`/api/student/proposals?student_id=${user.student_id}`);
            if (res.ok) {
                const data = await res.json();
                setProposals(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProposals();
    }, []);

    async function submitProposal(e: React.FormEvent) {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const userRaw = localStorage.getItem("user");
            if (!userRaw) return;
            const user = JSON.parse(userRaw);

            const res = await fetch("/api/student/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: user.student_id,
                    proposal_title: title,
                    proposal_description: description
                })
            });

            if (res.ok) {
                setOpenDialog(false);
                setTitle("");
                setDescription("");
                loadProposals();
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setSubmitLoading(false);
        }
    }

    const getStatusIcon = (status: string) => {
        if (status === 'APPROVED') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        if (status === 'REJECTED') return <XCircle className="h-5 w-5 text-red-500" />;
        return <Clock className="h-5 w-5 text-amber-500" />;
    };
    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Project Proposals</h2>
                        <p className="text-muted-foreground">Submit and track your project topic proposals.</p>
                    </div>
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Submit Proposal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Project Proposal</DialogTitle>
                                <DialogDescription>
                                    Submit a new topic idea to your faculty guide for approval.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submitProposal} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Project Title</Label>
                                    <Input
                                        required
                                        placeholder="E.g. Smart Traffic Management System"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description / Abstract</Label>
                                    <Textarea
                                        required
                                        placeholder="Briefly describe the problem statement and your proposed solution..."
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={submitLoading}>
                                    {submitLoading ? "Submitting..." : "Submit Proposal"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6">

                    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                        <CardHeader>
                            <CardTitle>My Submissions</CardTitle>
                            <CardDescription>Status of your submitted project proposals.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8 text-muted-foreground">Loading proposals...</div>
                            ) : proposals.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Lightbulb className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">No Proposals</h3>
                                    <p className="text-sm max-w-sm">
                                        You have not submitted any project proposals yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {proposals.map((proposal) => (
                                        <div key={proposal.proposal_id} className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 border rounded-lg bg-background/50">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-lg">{proposal.proposal_title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{proposal.proposal_description}</p>
                                                <div className="text-xs text-muted-foreground pt-2">
                                                    Submitted on: {new Date(proposal.submitted_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border whitespace-nowrap">
                                                {getStatusIcon(proposal.proposal_status)}
                                                <span className="text-sm font-medium">{proposal.proposal_status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
}
