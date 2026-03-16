"use client";

import AuthGuard from "@/app/components/AuthGuard";
import { PlusCircle, FileText, CheckCircle2, Clock, Users, Calendar, Loader2, Award, Milestone, User, Mail, Star, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { SettingsDialog } from "@/components/dashboard/settings-dialog";

interface DashboardData {
    student: { student_name: string; email: string };
    group: { project_group_id: number; group_name: string; project_title: string; status: string; project_description: string; project_area: string; is_leader: number } | null;
    members: { student_id: number; student_name: string; email: string; is_leader: number; cgpa: number }[];
    proposals: { proposal_id: number; proposal_title: string; proposal_status: string; submitted_at: string }[];
    meetings: { meeting_id: number; meeting_datetime: string; meeting_purpose: string; meeting_status: string; guide_name: string }[];
    attendance: { total: number; present: number };
    evaluations: { evaluation_id: number; marks: number; feedback: string; evaluated_at: string; evaluator_name: string }[];
    guideName: string | null;
}

export default function StudentDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/student/dashboard");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch { } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <AuthGuard>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AuthGuard>
        );
    }

    const attendancePct = data?.attendance?.total
        ? Math.round((data.attendance.present / data.attendance.total) * 100)
        : 0;

    const upcomingMeetings = data?.meetings?.filter(m => new Date(m.meeting_datetime) >= new Date()) || [];
    const approvedProposals = data?.proposals?.filter(p => p.proposal_status === "Approved") || [];

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Welcome, {data?.student?.student_name || "Student"}
                        </h2>
                        <p className="text-muted-foreground">
                            {data?.group ? data.group.group_name : "No group assigned yet"}
                        </p>
                    </div>
                    <Link href="/dashboard/student/create-project">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Project
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="milestones">Milestones</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* ===== OVERVIEW ===== */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize">
                                        {data?.group?.status || "No Group"}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {data?.group ? data.group.project_title || "Untitled project" : "Join or create a group"}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {upcomingMeetings.length > 0
                                            ? `Next: ${new Date(upcomingMeetings[0].meeting_datetime).toLocaleDateString()}`
                                            : "No meetings scheduled"}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.members?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {data?.guideName ? `Guide: ${data.guideName}` : "No guide assigned"}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{attendancePct}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {data?.attendance?.present || 0} of {data?.attendance?.total || 0} meetings
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            {/* Project Info */}
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>{data?.group ? "Project Details" : "Get Started"}</CardTitle>
                                    <CardDescription>
                                        {data?.group ? data.group.project_title : "Create or join a project group"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.group ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Group</p>
                                                    <p className="text-sm font-medium">{data.group.group_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Status</p>
                                                    <Badge variant={data.group.status === "Approved" ? "default" : "secondary"} className="capitalize">
                                                        {data.group.status}
                                                    </Badge>
                                                </div>
                                                {data.group.project_area && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Area</p>
                                                        <p className="text-sm font-medium">{data.group.project_area}</p>
                                                    </div>
                                                )}
                                                {data.guideName && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Guide</p>
                                                        <p className="text-sm font-medium">{data.guideName}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {data.group.project_description && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                                                    <p className="text-sm text-foreground/80">{data.group.project_description}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-lg border border-dashed border-border bg-muted/30 text-center flex flex-col items-center justify-center h-[200px]">
                                            <h3 className="text-lg font-semibold mb-2">No Project Group Found</h3>
                                            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                                                Create a new group to start your project journey.
                                            </p>
                                            <Link href="/dashboard/student/create-project">
                                                <Button size="lg">Create New Group</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Meetings */}
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Recent Meetings</CardTitle>
                                    <CardDescription>Latest scheduled meetings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.meetings && data.meetings.length > 0 ? (
                                        <div className="space-y-3">
                                            {data.meetings.slice(0, 5).map((m) => (
                                                <div key={m.meeting_id} className="flex items-start gap-3 p-2 rounded-md border bg-muted/20">
                                                    <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{m.meeting_purpose || "Meeting"}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(m.meeting_datetime).toLocaleString()} •{" "}
                                                            <span className="capitalize">{m.meeting_status}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No meetings yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ===== MILESTONES ===== */}
                    <TabsContent value="milestones" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Proposals */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> Proposals
                                    </CardTitle>
                                    <CardDescription>Project proposals submitted by your group</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.proposals && data.proposals.length > 0 ? (
                                        <div className="space-y-3">
                                            {data.proposals.map((p) => (
                                                <div key={p.proposal_id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{p.proposal_title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(p.submitted_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant={p.proposal_status === "Approved" ? "default" : p.proposal_status === "Rejected" ? "destructive" : "secondary"} className="capitalize">
                                                        {p.proposal_status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No proposals submitted yet.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Evaluations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" /> Evaluations
                                    </CardTitle>
                                    <CardDescription>Marks and feedback from evaluators</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.evaluations && data.evaluations.length > 0 ? (
                                        <div className="space-y-3">
                                            {data.evaluations.map((e) => (
                                                <div key={e.evaluation_id} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">{e.evaluator_name || "Evaluator"}</p>
                                                        <Badge variant="outline" className="font-bold">{e.marks} marks</Badge>
                                                    </div>
                                                    {e.feedback && (
                                                        <p className="text-xs text-muted-foreground">{e.feedback}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(e.evaluated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No evaluations yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ===== TEAM ===== */}
                    <TabsContent value="team" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" /> {data?.group?.group_name || "My Team"}
                                </CardTitle>
                                <CardDescription>
                                    {data?.group?.project_title || "Your project group members"}
                                    {data?.guideName && ` • Guide: ${data.guideName}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data?.members && data.members.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {data.members.map((m) => (
                                            <div key={m.student_id} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {m.student_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold truncate">{m.student_name}</p>
                                                        {m.is_leader === 1 && (
                                                            <Badge variant="default" className="text-[10px] px-1.5 py-0">Leader</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" /> {m.email}
                                                    </p>
                                                    {m.cgpa > 0 && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Star className="h-3 w-3" /> CGPA: {m.cgpa}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No group members found. Create or join a group first.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ===== SETTINGS ===== */}
                    <TabsContent value="settings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <SettingsIcon className="h-5 w-5" /> Settings
                                </CardTitle>
                                <CardDescription>Manage your preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                                    Open Settings
                                </Button>
                                <Separator />
                                <div className="space-y-3">
                                    <Link href="/dashboard/student/profile">
                                        <Button variant="ghost" className="w-full justify-start gap-2">
                                            <User className="h-4 w-4" /> Edit Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </AuthGuard>
    );
}