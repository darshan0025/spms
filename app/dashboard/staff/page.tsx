"use client";

import AuthGuard from "@/app/components/AuthGuard";
import { CheckSquare, Calendar, ClipboardCheck, Users, Loader2, FileText, Award, Mail, Star, User, Settings as SettingsIcon } from "lucide-react";
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
    staff: { staff_name: string; email: string };
    groups: any[];
    members: any[];
    meetings: any[];
    proposals: any[];
    evaluations: any[];
    stats: { totalGroups: number; totalStudents: number; pendingProposals: number; upcomingMeetings: number };
}

export default function StaffDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/staff/dashboard");
            if (res.ok) setData(await res.json());
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

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Welcome, {data?.staff?.staff_name || "Staff"}
                        </h2>
                        <p className="text-muted-foreground">
                            {data?.stats?.totalGroups || 0} groups assigned
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="milestones">Milestones</TabsTrigger>
                        <TabsTrigger value="team">Teams</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* ===== OVERVIEW ===== */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Assigned Groups</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.stats?.totalGroups || 0}</div>
                                    <p className="text-xs text-muted-foreground">Project groups under you</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Proposals</CardTitle>
                                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.stats?.pendingProposals || 0}</div>
                                    <p className="text-xs text-muted-foreground">Awaiting your review</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.stats?.upcomingMeetings || 0}</div>
                                    <p className="text-xs text-muted-foreground">Scheduled ahead</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.stats?.totalStudents || 0}</div>
                                    <p className="text-xs text-muted-foreground">Across all your groups</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Recent Meetings</CardTitle>
                                    <CardDescription>Your scheduled meetings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.meetings && data.meetings.length > 0 ? (
                                        <div className="space-y-3">
                                            {data.meetings.slice(0, 5).map((m: any) => (
                                                <div key={m.meeting_id} className="flex items-center border-l-4 border-primary pl-4 py-2 bg-muted/20 rounded-r-md">
                                                    <div className="w-28 text-sm font-bold text-muted-foreground">
                                                        {new Date(m.meeting_datetime).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm">{m.meeting_purpose || "Meeting"}</h4>
                                                        <span className="text-xs text-muted-foreground">{m.group_name} • <span className="capitalize">{m.meeting_status}</span></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No meetings scheduled.</p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Pending Proposals</CardTitle>
                                    <CardDescription>Proposals needing review</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.proposals?.filter((p: any) => p.proposal_status === "Pending").length ? (
                                        <div className="space-y-3">
                                            {data.proposals.filter((p: any) => p.proposal_status === "Pending").slice(0, 5).map((p: any) => (
                                                <div key={p.proposal_id} className="p-3 rounded-md bg-muted/20 border">
                                                    <p className="text-sm font-medium">{p.proposal_title}</p>
                                                    <p className="text-xs text-muted-foreground">{p.group_name} • {new Date(p.submitted_at).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No pending proposals.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ===== MILESTONES ===== */}
                    <TabsContent value="milestones" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> All Proposals
                                    </CardTitle>
                                    <CardDescription>Proposals from your assigned groups</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.proposals && data.proposals.length > 0 ? (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                            {data.proposals.map((p: any) => (
                                                <div key={p.proposal_id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{p.proposal_title}</p>
                                                        <p className="text-xs text-muted-foreground">{p.group_name} • {new Date(p.submitted_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge variant={p.proposal_status === "Approved" ? "default" : p.proposal_status === "Rejected" ? "destructive" : "secondary"} className="capitalize">
                                                        {p.proposal_status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No proposals yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" /> Evaluations Given
                                    </CardTitle>
                                    <CardDescription>Your marks and feedback</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data?.evaluations && data.evaluations.length > 0 ? (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                            {data.evaluations.map((e: any) => (
                                                <div key={e.evaluation_id} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">{e.group_name}</p>
                                                        <Badge variant="outline" className="font-bold">{e.marks} marks</Badge>
                                                    </div>
                                                    {e.feedback && <p className="text-xs text-muted-foreground">{e.feedback}</p>}
                                                    <p className="text-xs text-muted-foreground">{new Date(e.evaluated_at).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No evaluations given yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ===== TEAMS ===== */}
                    <TabsContent value="team" className="space-y-4">
                        {data?.groups && data.groups.length > 0 ? (
                            data.groups.map((g: any) => {
                                const groupMembers = data.members?.filter((m: any) => m.project_group_id === g.project_group_id) || [];
                                return (
                                    <Card key={g.project_group_id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Users className="h-5 w-5" /> {g.group_name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {g.project_title || "Untitled"} • Your role: {g.staff_role}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={g.status === "Approved" ? "default" : "secondary"} className="capitalize">{g.status}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {groupMembers.length > 0 ? (
                                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                    {groupMembers.map((m: any) => (
                                                        <div key={m.student_id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                                                    {m.student_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="text-sm font-medium truncate">{m.student_name}</p>
                                                                    {m.is_leader === 1 && <Badge variant="default" className="text-[10px] px-1.5 py-0">Leader</Badge>}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No members in this group.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card>
                                <CardContent className="text-center py-8 text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No groups assigned to you.</p>
                                </CardContent>
                            </Card>
                        )}
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
                                    <Link href="/dashboard/staff/profile">
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
