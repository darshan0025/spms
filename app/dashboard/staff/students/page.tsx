"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Mail, Phone, GraduationCap, Crown } from "lucide-react";

export default function StaffStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadStudents() {
        try {
            const userRaw = localStorage.getItem("user");
            if (!userRaw) {
                console.error("No user found in localStorage");
                return;
            }
            const user = JSON.parse(userRaw);
            console.log("Loading students for staff user:", user);

            const res = await fetch(`/api/staff/students?staff_id=${user.staff_id}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`Fetched ${data.length} students`);
                setStudents(data);
            } else {
                const errorData = await res.json();
                console.error("Error fetching students:", errorData);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStudents();
    }, []);

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Assigned Students</h2>
                        <p className="text-muted-foreground">Students belonging to the project groups you guide or supervise.</p>
                    </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle>My Students</CardTitle>
                        <CardDescription>Overview of student contact details and roles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8 text-muted-foreground">Loading students...</div>
                        ) : students.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">No Students Found</h3>
                                <p className="text-sm max-w-sm">
                                    You are not currently assigned to any project groups containing students.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Project Group</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">CGPA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student, index) => (
                                        <TableRow key={`${student.student_id}-${student.project_group_id}-${index}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <GraduationCap className="h-4 w-4 text-primary" />
                                                    {student.student_name}
                                                    {student.username && <span className="text-xs font-normal text-muted-foreground">(@{student.username})</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-muted-foreground space-y-1">
                                                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {student.email}</span>
                                                    {student.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{student.group_name || "Unnamed Group"}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={student.project_title}>{student.project_title || "No Title"}</div>
                                            </TableCell>
                                            <TableCell>
                                                {student.is_leader ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                                                        <Crown className="h-3 w-3" /> Leader
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                        Member
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {student.cgpa || "-"}
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
