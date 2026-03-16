"use client";

import AuthGuard from "@/app/components/AuthGuard";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    User, Mail, Phone, Building2, GraduationCap, FolderOpen,
    Shield, Loader2, CheckCircle2, AlertCircle, Pencil, X, Save, Lock
} from "lucide-react";

interface ProfileData {
    role: string;
    name: string;
    email: string;
    phone?: string;
    username?: string;
    department?: string;
    academic_year?: string;
    groups?: any[];
}

export default function ProfilePage() {
    const pathname = usePathname();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [form, setForm] = useState({ name: "", email: "", phone: "" });

    // Change Password State
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/profile");
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                setEditing(false);
                fetchProfile();

                // Update localStorage so navbar reflects the change
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.name = form.name;
                    user.email = form.email;
                    localStorage.setItem("user", JSON.stringify(user));
                }
            } else {
                const data = await res.json();
                setMessage({ type: "error", text: data.error || "Failed to update profile." });
            }
        } catch {
            setMessage({ type: "error", text: "Network error. Please try again." });
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setPasswordError(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch("/api/profile/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: "Password updated successfully!" });
                setPasswordDialogOpen(false);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setPasswordError(data.error || "Failed to update password.");
            }
        } catch {
            setPasswordError("Network error. Please try again.");
        } finally {
            setPasswordLoading(false);
        }
    }

    function cancelEdit() {
        setEditing(false);
        if (profile) {
            setForm({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" });
        }
    }

    const roleMatch = pathname?.match(/\/dashboard\/(admin|staff|student)/);
    const roleSlug = roleMatch ? roleMatch[1] : "student";

    if (loading) {
        return (
            <AuthGuard>
                <div className="flex-1 flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AuthGuard>
        );
    }

    if (!profile) {
        return (
            <AuthGuard>
                <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Failed to load profile.</p>
                </div>
            </AuthGuard>
        );
    }

    const initials = profile.name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const roleBadgeColor =
        profile.role === "ADMIN"
            ? "bg-red-500/15 text-red-600 border-red-500/30"
            : profile.role === "STAFF"
            ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
            : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";

    return (
        <AuthGuard>
            <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                        <p className="text-muted-foreground">Manage your account information.</p>
                    </div>

                    <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Lock className="h-4 w-4" />
                                Change Password
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                    Enter your current password and a new one to update your account security.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                                {passwordError && (
                                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {passwordError}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        required
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={passwordLoading} className="w-full sm:w-auto gap-2">
                                        {passwordLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Lock className="h-4 w-4" />
                                        )}
                                        {passwordLoading ? "Updating..." : "Update Password"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Status Message */}
                {message && (
                    <div
                        className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium border transition-all ${
                            message.type === "success"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                    >
                        {message.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 shrink-0" />
                        )}
                        {message.text}
                    </div>
                )}

                {/* Profile Card */}
                <Card className="bg-background/60 backdrop-blur-xl border-border/50 overflow-hidden">
                    {/* Gradient Banner */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
                        <div className="absolute -bottom-12 left-8">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute top-4 right-4">
                            <Badge className={`${roleBadgeColor} border font-semibold px-3 py-1`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {profile.role}
                            </Badge>
                        </div>
                    </div>

                    <CardContent className="pt-16 pb-8 px-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold">{profile.name}</h3>
                                <p className="text-muted-foreground">{profile.email}</p>
                            </div>
                            {!editing && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                    className="gap-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {/* Info Grid or Edit Form */}
                        {editing ? (
                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {profile.role === "STUDENT" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                )}
                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                        <Lock className="h-4 w-4" />
                                        Security Settings
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setPasswordDialogOpen(true)}
                                        className="w-full gap-2 justify-start font-normal border-dashed"
                                    >
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        Update Account Password
                                    </Button>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button variant="outline" onClick={cancelEdit} disabled={saving} className="gap-2">
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <InfoItem icon={<User className="h-4 w-4" />} label="Full Name" value={profile.name} />
                                <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
                                {profile.phone && (
                                    <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
                                )}
                                {profile.department && (
                                    <InfoItem icon={<Building2 className="h-4 w-4" />} label="Department" value={profile.department} />
                                )}
                                {profile.academic_year && (
                                    <InfoItem icon={<GraduationCap className="h-4 w-4" />} label="Academic Year" value={profile.academic_year} />
                                )}
                                {profile.username && (
                                    <InfoItem icon={<Shield className="h-4 w-4" />} label="Username" value={profile.username} />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Project Groups */}
                {profile.groups && profile.groups.length > 0 && (
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderOpen className="h-5 w-5 text-primary" />
                                Assigned Project Groups
                            </CardTitle>
                            <CardDescription>
                                {profile.role === "STUDENT"
                                    ? "Project groups you are a member of."
                                    : "Project groups assigned to you."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {profile.groups.map((g: any) => (
                                    <div
                                        key={g.project_group_id}
                                        className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FolderOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {g.group_name || g.project_title || `Group ${g.project_group_id}`}
                                            </p>
                                            {g.project_title && g.group_name && (
                                                <p className="text-xs text-muted-foreground truncate">{g.project_title}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-1.5 py-0 ${
                                                        g.status === "APPROVED"
                                                            ? "border-emerald-500/30 text-emerald-600"
                                                            : g.status === "PENDING"
                                                            ? "border-yellow-500/30 text-yellow-600"
                                                            : "border-border text-muted-foreground"
                                                    }`}
                                                >
                                                    {g.status}
                                                </Badge>
                                                {g.assigned_role && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                                                        {g.assigned_role}
                                                    </Badge>
                                                )}
                                                {g.is_leader === 1 && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600">
                                                        Leader
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthGuard>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
        </div>
    );
}
