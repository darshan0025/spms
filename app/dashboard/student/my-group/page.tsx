"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, User, Crown, FolderGit2 } from "lucide-react";

export default function MyGroupPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                console.log("MyGroupPage: User from localStorage:", user);
                console.log("MyGroupPage: Fetching for student_id:", user.student_id);
                fetch(`/api/student/my-group?student_id=${user.student_id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.groups) {
                            setGroups(data.groups);
                        } else if (data.group) {
                            setGroups([data.group]);
                        }
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        setLoading(false);
                    });
            } catch (e) {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">My Project Group</h2>
                        <p className="text-muted-foreground">View details about your assigned project group and peers.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <span className="text-muted-foreground animate-pulse">Loading group details...</span>
                    </div>
                ) : groups.length > 0 ? (
                    <div className="space-y-12">
                        {groups.map((group, index) => (
                            <div key={`${group.project_group_id}-${index}`} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pb-8 border-b border-border/20 last:border-0 last:pb-0">
                                <Card className="col-span-4 bg-background/60 backdrop-blur-xl border-border/50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FolderGit2 className="h-5 w-5 text-primary" />
                                            Project Details {groups.length > 1 ? `(${index + 1})` : ''}
                                        </CardTitle>
                                        <CardDescription>Information about your project topic and area.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-lg">{group.project_title}</h3>
                                            <p className="text-sm text-muted-foreground">{group.project_area} • {group.project_type_name}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Description</h4>
                                            <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-md border">
                                                {group.project_description || "No description provided."}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Convener</p>
                                                <p className="text-sm font-medium">{group.convener_name || "Unassigned"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Expert</p>
                                                <p className="text-sm font-medium">{group.expert_name || "Unassigned"}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-muted-foreground">Status</p>
                                                <div className="mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        group.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        group.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                        {group.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="col-span-3 bg-background/60 backdrop-blur-xl border-border/50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary" />
                                            Group Members
                                        </CardTitle>
                                        <CardDescription>{group.group_name} {group.department_name ? `(${group.department_name})` : ''}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {group.members?.map((member: any, idx: number) => (
                                                <div key={`${group.project_group_id}-${member.student_id}-${idx}`} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${member.is_leader ? 'bg-primary/20' : 'bg-muted'}`}>
                                                        {member.is_leader ? (
                                                            <Crown className="h-5 w-5 text-primary" />
                                                        ) : (
                                                            <User className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {member.student_name}
                                                            {member.is_leader ? <span className="ml-2 text-xs text-primary font-semibold">(Leader)</span> : null}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">{member.student_id} • {member.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                        <CardHeader>
                            <CardTitle>Group Overview</CardTitle>
                            <CardDescription>Your current project group assignment status.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Not Assigned Yet</h3>
                            <p className="text-sm max-w-sm text-muted-foreground">
                                You are not currently part of any project group. Create a proposal or wait for an admin to assign you.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthGuard>
    );
}
