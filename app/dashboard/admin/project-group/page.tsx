"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, X, Users, Info, FolderGit2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectGroupPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [projectTypes, setProjectTypes] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Detail dialog state
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [form, setForm] = useState({
        group_name: "",
        project_title: "",
        project_area: "",
        project_description: "",
        project_type_id: "",
        convener_staff_id: "",
        expert_staff_id: "",
        department_id: "",
        status: "PENDING"
    });

    async function loadData() {
        try {
            const [grpRes, ptRes, dRes, sRes] = await Promise.all([
                fetch("/api/project-group"),
                fetch("/api/project-type"),
                fetch("/api/academic/department"),
                fetch("/api/staff")
            ]);

            if (grpRes.ok) setGroups(await grpRes.json());
            if (ptRes.ok) setProjectTypes(await ptRes.json());
            if (dRes.ok) setDepartments(await dRes.json());
            if (sRes.ok) setStaff(await sRes.json());
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchGroupDetails(groupId: string) {
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/project-group?group_id=${groupId}`);
            if (res.ok) {
                setSelectedGroup(await res.json());
            }
        } catch { }
        setDetailLoading(false);
    }

    async function saveGroup() {
        if (!form.project_title) return;
        setLoading(true);

        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { project_group_id: editingId, ...form } : form;

        const res = await fetch("/api/project-group", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            cancelEdit();
            loadData();
        } else {
            alert("Failed to save project group.");
        }
        setLoading(false);
    }

    async function deleteGroup(id: string) {
        if (!confirm("Delete this Project Group? This will also remove all related members, meetings, evaluations, proposals, and documents.")) return;

        const res = await fetch("/api/project-group", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        if (!res.ok) {
            const data = await res.json();
            alert(data.error || "Failed to delete project group.");
        }
        loadData();
    }

    function startEdit(g: any) {
        setEditingId(g.project_group_id);
        setForm({
            group_name: g.group_name || "",
            project_title: g.project_title || "",
            project_area: g.project_area || "",
            project_description: g.project_description || "",
            project_type_id: g.project_type_id?.toString() || "",
            convener_staff_id: g.convener_staff_id?.toString() || "",
            expert_staff_id: g.expert_staff_id?.toString() || "",
            department_id: g.department_id?.toString() || "",
            status: g.status || "PENDING"
        });
        document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({
            group_name: "",
            project_title: "",
            project_area: "",
            project_description: "",
            project_type_id: "",
            convener_staff_id: "",
            expert_staff_id: "",
            department_id: "",
            status: "PENDING"
        });
    }

    useEffect(() => {
        loadData();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "COMPLETED": return "bg-emerald-500/10 text-emerald-500";
            case "IN PROGRESS": return "bg-blue-500/10 text-blue-500";
            case "CANCELLED": return "bg-red-500/10 text-red-500";
            default: return "bg-yellow-500/10 text-yellow-500";
        }
    };

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Project Group Master</h2>
                        <p className="text-muted-foreground">Manage project groups, areas, and faculty assignments.</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <Card id="form-section" className="lg:col-span-1 h-fit border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Group" : "Create Group"}</CardTitle>
                            <CardDescription>Enter project definitions and tracking fields.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Group Name</Label>
                                <Input
                                    placeholder="Group A"
                                    value={form.group_name}
                                    onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Project Title *</Label>
                                <Input
                                    placeholder="AI Based Automation"
                                    value={form.project_title}
                                    onChange={(e) => setForm({ ...form, project_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Project Area</Label>
                                <Input
                                    placeholder="Machine Learning"
                                    value={form.project_area}
                                    onChange={(e) => setForm({ ...form, project_area: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    className="resize-none"
                                    rows={3}
                                    placeholder="Brief description of the project goals..."
                                    value={form.project_description}
                                    onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Project Type</Label>
                                    <Select
                                        value={form.project_type_id}
                                        onChange={(val) => setForm({ ...form, project_type_id: val })}
                                        options={projectTypes.map(pt => ({ label: pt.project_type_name, value: pt.project_type_id?.toString() }))}
                                        placeholder="Type"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select
                                        value={form.department_id}
                                        onChange={(val) => setForm({ ...form, department_id: val })}
                                        options={departments.map(d => ({ label: d.department_name, value: d.department_id?.toString() }))}
                                        placeholder="Dept"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Convener</Label>
                                    <Select
                                        value={form.convener_staff_id}
                                        onChange={(val) => setForm({ ...form, convener_staff_id: val })}
                                        options={staff.map(s => ({ label: s.staff_name, value: s.staff_id?.toString() }))}
                                        placeholder="Convener"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expert</Label>
                                    <Select
                                        value={form.expert_staff_id}
                                        onChange={(val) => setForm({ ...form, expert_staff_id: val })}
                                        options={staff.map(s => ({ label: s.staff_name, value: s.staff_id?.toString() }))}
                                        placeholder="Expert"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={form.status}
                                    onChange={(val) => setForm({ ...form, status: val })}
                                    options={[
                                        { label: "PENDING", value: "PENDING" },
                                        { label: "IN PROGRESS", value: "IN PROGRESS" },
                                        { label: "COMPLETED", value: "COMPLETED" },
                                        { label: "CANCELLED", value: "CANCELLED" }
                                    ]}
                                    placeholder="Select Status"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button onClick={saveGroup} className="flex-1" disabled={loading || !form.project_title}>
                                    {loading ? "Saving..." : (editingId ? "Update" : "Create Group")}
                                </Button>
                                {editingId && (
                                    <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Existing Project Groups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group Details</TableHead>
                                        <TableHead>Assignments</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No project groups found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        groups.map((g) => (
                                            <TableRow key={g.project_group_id} className="cursor-pointer" onClick={() => fetchGroupDetails(g.project_group_id)}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-primary hover:underline">{g.project_title || "Untitled"}</span>
                                                        <span className="text-xs text-muted-foreground">{g.group_name || "N/A"} • {g.department_name || "No Dept"}</span>
                                                        <span className="text-xs mt-1">{g.project_type_name || "No Type"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs space-y-1">
                                                        <span className="text-muted-foreground">Area: {g.project_area || "N/A"}</span>
                                                        <span>Conv: {g.convener_name || "Unassigned"}</span>
                                                        <span>Expr: {g.expert_name || "Unassigned"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`px-2 py-1 inline-flex items-center text-xs rounded-full font-medium ${getStatusStyle(g.status)}`}>
                                                        {g.status || "PENDING"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon"
                                                            onClick={(e) => { e.stopPropagation(); fetchGroupDetails(g.project_group_id); }}
                                                            className="hover:bg-blue-500/10 hover:text-blue-500">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            onClick={(e) => { e.stopPropagation(); startEdit(g); }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            onClick={(e) => { e.stopPropagation(); deleteGroup(g.project_group_id); }}
                                                            className="text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Project Group Detail Dialog */}
            <Dialog open={!!selectedGroup} onOpenChange={(open) => { if (!open) setSelectedGroup(null); }}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderGit2 className="h-5 w-5 text-primary" />
                            Project Group Details
                        </DialogTitle>
                    </DialogHeader>

                    {detailLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" /> Loading details...
                        </div>
                    ) : selectedGroup && (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start gap-4 pb-4 border-b">
                                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <FolderGit2 className="h-7 w-7" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold">{selectedGroup.project_title || 'Untitled'}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedGroup.group_name}</p>
                                    <Badge className={`mt-1 capitalize ${getStatusStyle(selectedGroup.status)}`} variant="secondary">
                                        {selectedGroup.status || 'PENDING'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Project Area</p>
                                    <p className="text-sm font-medium">{selectedGroup.project_area || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Project Type</p>
                                    <p className="text-sm font-medium">{selectedGroup.project_type_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Department</p>
                                    <p className="text-sm font-medium">{selectedGroup.department_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Guide</p>
                                    <p className="text-sm font-medium">{selectedGroup.guide_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Convener</p>
                                    <p className="text-sm font-medium">{selectedGroup.convener_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Expert</p>
                                    <p className="text-sm font-medium">{selectedGroup.expert_name || '—'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedGroup.project_description && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                                    <p className="text-sm bg-muted/20 p-3 rounded-md border leading-relaxed">{selectedGroup.project_description}</p>
                                </div>
                            )}

                            {/* Members */}
                            <div className="pt-2 border-t">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Members {selectedGroup.members ? `(${selectedGroup.members.length})` : ''}
                                </h4>
                                {selectedGroup.members && selectedGroup.members.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedGroup.members.map((m: any, idx: number) => (
                                            <div key={`${m.student_id}-${idx}`} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {m.student_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">
                                                        {m.student_name}
                                                        {m.is_leader === 1 && (
                                                            <Badge variant="default" className="text-[10px] px-1.5 py-0 ml-2">Leader</Badge>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{m.email} {m.phone ? `• ${m.phone}` : ''}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No members assigned yet.</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t">
                                <Button variant="outline" className="flex-1" onClick={() => { setSelectedGroup(null); const g = groups.find(x => x.project_group_id === selectedGroup.project_group_id); if (g) startEdit(g); }}>
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedGroup(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthGuard>
    );
}
