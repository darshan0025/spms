"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EvaluationsPage() {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        setLoading(true);
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const res = await fetch(`/api/student/evaluations?student_id=${user.student_id}`);
                if (res.ok) {
                    setEvaluations(await res.json());
                }
            } catch (error) {
                console.error("Error fetching evaluations", error);
            }
        }
        setLoading(false);
    };
    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Evaluations & Grades</h2>
                        <p className="text-muted-foreground">View feedback and marks from your project guides.</p>
                    </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle>Final Assessment</CardTitle>
                        <CardDescription>Academic grading for your project.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">Loading evaluations...</div>
                        ) : evaluations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">No Grades Posted</h3>
                                <p className="text-sm max-w-sm">
                                    Your project evaluations are currently pending or have not been started.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Evaluated By</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Marks</TableHead>
                                        <TableHead>Feedback</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {evaluations.map((e, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {e.evaluator_name || "Faculty"}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(e.evaluated_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-primary text-lg">{e.marks}/100</span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-pre-wrap">
                                                {e.feedback || "No additional feedback."}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthGuard>
    );
}
