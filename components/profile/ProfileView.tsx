"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Hash, Calendar, Phone, Edit2 } from "lucide-react";

interface ProfileViewProps {
    user: any;
    onEdit: () => void;
    onChangePassword?: () => void;
}

export default function ProfileView({ user, onEdit, onChangePassword }: ProfileViewProps) {
    if (!user) return <div className="text-muted-foreground p-4">No user profile data available.</div>;

    const initials = user.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <Card className="w-full shadow-md border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/10">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                        <CardDescription className="text-base flex items-center gap-2">
                            <span className="capitalize badge bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium">
                                {user.role}
                            </span>
                            • {user.email}
                        </CardDescription>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
                    <Edit2 className="h-4 w-4" /> Edit Profile
                </Button>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="grid gap-6 md:grid-cols-2">

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold tracking-tight">Contact Information</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                            <div className="p-2 rounded-full bg-background border shadow-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                <p className="text-sm font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                            <div className="p-2 rounded-full bg-background border shadow-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                <p className="text-sm font-medium">{user.phone || "Not provided"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {(user.enrollment_no || user.current_year) && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold tracking-tight">Academic Details</h3>
                        <div className="grid gap-4">
                            {user.enrollment_no && (
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                    <div className="p-2 rounded-full bg-background border shadow-sm">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Enrollment Number</p>
                                        <p className="text-sm font-medium">{user.enrollment_no}</p>
                                    </div>
                                </div>
                            )}

                            {user.current_year && (
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                    <div className="p-2 rounded-full bg-background border shadow-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Current Year</p>
                                        <p className="text-sm font-medium">{user.current_year}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold tracking-tight">Account Security</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-background border shadow-sm">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Password</p>
                                    <p className="text-sm font-bold tracking-widest pt-1">••••••••</p>
                                </div>
                            </div>
                            {onChangePassword && (
                                <Button variant="outline" size="sm" onClick={onChangePassword}>
                                    Change Password
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
