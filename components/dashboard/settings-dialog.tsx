"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { User, Mail, Phone, Shield, Hash, Calendar, Loader2, AlertCircle, Lock, Pencil, Building2, GraduationCap } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const settingsCategories = [
    "Profile",
    "General",
    "Account",
];

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: string;
}

export function SettingsDialog({ open, onOpenChange, initialTab = "General" }: SettingsDialogProps) {
    const [activeTab, setActiveTab] = React.useState(initialTab);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = React.useState<any>(null);
    const [profileLoading, setProfileLoading] = React.useState(false);

    React.useEffect(() => {
        if (open && initialTab) {
            setActiveTab(initialTab);
        }
    }, [open, initialTab]);

    React.useEffect(() => {
        if (open && !user) {
            handleRefreshUser();
        }
    }, [open, user]);

    const handleRefreshUser = () => {
        setProfileLoading(true);
        fetch("/api/profile")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setUser(data))
            .catch(() => { })
            .finally(() => setProfileLoading(false));
    };

    const handleLogout = () => {
        router.push("/login");
    };

    const roleMatch = pathname?.match(/\/dashboard\/(admin|staff|student)/);
    const role = roleMatch ? roleMatch[1] : "student";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[700px] p-0 overflow-hidden bg-background h-[80vh] flex flex-col sm:h-[500px] sm:flex-row shadow-2xl border-muted">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                {/* Sidebar Navigation */}
                <div className="w-full sm:w-[200px] border-r bg-muted/30 p-4 overflow-y-auto">
                    <nav className="flex flex-col space-y-1">
                        {settingsCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`flex items-center text-sm font-medium rounded-md px-3 py-2 transition-colors ${activeTab === category
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "Profile" ? (
                        profileLoading && !user ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : user ? (
                            <ProfileTab user={user} onRefresh={handleRefreshUser} />
                        ) : (
                            <p className="p-6 text-sm text-muted-foreground">Unable to load profile.</p>
                        )
                    ) : activeTab === "General" ? (
                        <div className="p-6 space-y-6">
                            <h2 className="text-xl font-semibold mb-6">General</h2>

                            <div className="space-y-6">
                                {/* Appearance */}
                                <div className="flex items-center justify-between pb-4 border-b">
                                    <Label htmlFor="appearance" className="text-base font-normal">Appearance</Label>
                                    <Select
                                        value={theme || "system"}
                                        onChange={setTheme}
                                        className="w-[140px] border-none shadow-none focus-visible:ring-0"
                                        placeholder="System"
                                        options={[
                                            { label: "System", value: "system" },
                                            { label: "Light", value: "light" },
                                            { label: "Dark", value: "dark" }
                                        ]}
                                    />
                                </div>

                                {/* Language */}
                                <div className="flex items-center justify-between pb-4 border-b">
                                    <Label htmlFor="language" className="text-base font-normal">Language</Label>
                                    <Select
                                        value="auto"
                                        className="w-[140px] border-none shadow-none focus-visible:ring-0"
                                        placeholder="Auto-detect"
                                        options={[
                                            { label: "Auto-detect", value: "auto" },
                                            { label: "English", value: "en" }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : activeTab === "Account" ? (
                        <div className="p-6 space-y-6">
                            <h2 className="text-xl font-semibold mb-6">Account</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-normal">Log out</Label>
                                        <p className="text-xs text-muted-foreground">Log out of your current session on this device.</p>
                                    </div>
                                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={handleLogout}>Log out</Button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Profile Tab Content Component
function ProfileTab({ user, onRefresh }: { user: any, onRefresh: () => void }) {
    const [editing, setEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
    const [form, setForm] = React.useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || ""
    });

    // Change Password State
    const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
    const [passwordForm, setPasswordForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordLoading, setPasswordLoading] = React.useState(false);
    const [passwordError, setPasswordError] = React.useState<string | null>(null);

    // Update form when user data loads
    React.useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || ""
            });
        }
    }, [user]);

    const handleSave = async () => {
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
                onRefresh();

                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const localUser = JSON.parse(storedUser);
                    localUser.name = form.name;
                    localUser.email = form.email;
                    localStorage.setItem("user", JSON.stringify(localUser));
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
    };

    const handleChangePassword = async (e: React.FormEvent) => {
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
                method: "PUT",
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
    };

    const initials = user?.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const roleBadgeColor =
        user?.role === "ADMIN"
            ? "bg-red-500/15 text-red-600 border-red-500/30"
            : user?.role === "STAFF"
                ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";

    return (
        <div className="space-y-6">
            {/* Password Change Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription className="text-xs">
                            Update your account security.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-3 py-2">
                        {passwordError && (
                            <div className="p-2 rounded bg-destructive/10 text-destructive text-[10px] border border-destructive/20 flex items-center gap-2">
                                <AlertCircle className="h-3 w-3" />
                                {passwordError}
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                required
                                className="h-8 text-sm"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                required
                                className="h-8 text-sm"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                className="h-8 text-sm"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            />
                        </div>
                        <Button type="submit" disabled={passwordLoading} className="w-full h-8 text-xs gap-2 mt-2">
                            {passwordLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                            Update Password
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Gradient Banner & Avatar */}
            <div className="relative">
                <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-lg"></div>
                <div className="absolute -bottom-6 left-6">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="absolute top-4 right-4">
                    <div className={`${roleBadgeColor} border text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                        <Shield className="h-3 w-3" />
                        {user?.role}
                    </div>
                </div>
            </div>

            <div className="pt-8 px-6 pb-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold">{editing ? "Edit Profile" : user?.name}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    {!editing && (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
                            <Pencil className="h-3 w-3" /> Edit
                        </Button>
                    )}
                </div>

                {message && (
                    <div className={`text-xs p-2 rounded border flex items-center gap-2 ${message.type === "success"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}>
                        {message.text}
                    </div>
                )}

                {editing ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-xs">Full Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    className="h-8 text-sm"
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-xs">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    className="h-8 text-sm"
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone" className="text-xs">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    className="h-8 text-sm"
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t space-y-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                <Lock className="h-3 w-3" />
                                Security Settings
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPasswordDialogOpen(true)}
                                className="w-full gap-2 justify-start font-normal border-dashed text-xs h-8"
                            >
                                <Lock className="h-3 w-3 text-muted-foreground" />
                                Update Account Password
                            </Button>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                                Save Changes
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <DialogInfoItem icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={user?.email} />
                        <DialogInfoItem icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={user?.phone || "Not set"} />
                        {user?.department && (
                            <DialogInfoItem icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={user.department} />
                        )}
                        {user?.academic_year && (
                            <DialogInfoItem icon={<GraduationCap className="h-3.5 w-3.5" />} label="Year" value={user.academic_year} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function DialogInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-2.5 rounded-md border bg-muted/20">
            <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-tight">{label}</p>
                <p className="text-xs font-medium truncate">{value}</p>
            </div>
        </div>
    );
}
