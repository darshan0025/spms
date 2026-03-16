"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, X, Plus, GraduationCap, Eye, EyeOff, Info, FolderGit2, Users, ArrowLeft, Loader2, Lock as LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

export default function StudentPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [depts, setDepts] = useState<any[]>([]);

    const [form, setForm] = useState({
        student_id: "",
        student_name: "",
        email: "",
        phone: "",
        department_id: "",
        academic_year_id: "",
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentGroups, setStudentGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [groupLoading, setGroupLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function loadData() {
        try {
            const [stuRes, yrRes, deptRes] = await Promise.all([
                fetch("/api/student"),
                fetch("/api/academic/year"),
                fetch("/api/academic/department")
            ]);

            if (stuRes.ok) setStudents(await stuRes.json());
            if (yrRes.ok) setYears(await yrRes.json());
            if (deptRes.ok) setDepts(await deptRes.json());
        } catch (e) { }
    }

    async function fetchStudentGroups(studentId: string) {
        setGroupLoading(true);
        try {
            const res = await fetch(`/api/student/my-group?student_id=${studentId}`);
            if (res.ok) {
                const data = await res.json();
                setStudentGroups(data.groups || (data.group ? [data.group] : []));
            } else {
                setStudentGroups([]);
            }
        } catch { setStudentGroups([]); }
        setGroupLoading(false);
    }

    useEffect(() => {
        if (selectedStudent) {
            fetchStudentGroups(selectedStudent.student_id);
            setSelectedGroup(null);
        } else {
            setStudentGroups([]);
            setSelectedGroup(null);
        }
    }, [selectedStudent]);

    async function saveStudent() {
        if (!form.student_name || !form.email) return;
        setLoading(true);

        const method = editingId ? "PUT" : "POST";

        const res = await fetch("/api/student", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Error: " + err.error);
            setLoading(false);
            return;
        }

        cancelEdit();
        setLoading(false);
        loadData();
    }

    async function deleteStudent(id: string) {
        if (!confirm("Are you sure?")) return;
        const res = await fetch("/api/student", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id: id })
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Error deleting student: " + err.error);
            return;
        }

        loadData();
    }

    function startEdit(s: any) {
        setEditingId(s.student_id);
        setForm(s);
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({
            student_id: "",
            student_name: "",
            email: "",
            phone: "",
            department_id: "",
            academic_year_id: "",
            username: "",
            password: ""
        });
    }

    useEffect(() => {
        loadData();
    }, []);

    // Helpers for display
    const getDeptName = (id: string) => depts.find(d => d.department_id == id)?.department_name || id;
    const getYearName = (id: string) => years.find(y => y.academic_year_id == id)?.year_name || id;

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
                        <p className="text-muted-foreground">Manage student enrollment and details.</p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Form */}
                    <Card className="lg:col-span-1 h-fit border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Student" : "Enrol New Student"}</CardTitle>
                            <CardDescription>
                                {editingId ? "Update student records." : "Add a new student to the system."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    placeholder="Jane Doe"
                                    value={form.student_name || ""}
                                    onChange={e => setForm({ ...form, student_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    placeholder="jane@college.edu"
                                    value={form.email || ""}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input
                                    placeholder="+1 234 567 890"
                                    value={form.phone || ""}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input
                                    placeholder="student123"
                                    value={form.username || ""}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password {editingId && <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep current)</span>}</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password || ""}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select
                                        value={form.department_id}
                                        onChange={(val) => setForm({ ...form, department_id: val })}
                                        options={depts.map(d => ({ label: d.department_name, value: d.department_id?.toString() }))}
                                        placeholder="Select Dept"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Select
                                        value={form.academic_year_id}
                                        onChange={(val) => setForm({ ...form, academic_year_id: val })}
                                        options={years.map(y => ({ label: y.year_name, value: y.academic_year_id?.toString() }))}
                                        placeholder="Select Year"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button onClick={saveStudent} className="flex-1" disabled={loading}>
                                    {loading ? "Saving..." : (editingId ? "Update" : "Enrol Student")}
                                </Button>
                                {editingId && (
                                    <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* List */}
                    <Card className="lg:col-span-2 border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Enrolled Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone & Auth</TableHead>
                                        <TableHead>Dept/Year</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((s) => (
                                            <TableRow key={s.student_id} className="cursor-pointer" onClick={() => setSelectedStudent(s)}>
                                                <TableCell className="font-medium text-xs text-muted-foreground">{s.student_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap className="h-4 w-4 text-primary" />
                                                        <span className="hover:underline text-primary font-medium">{s.student_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{s.phone}</span><br />
                                                    <span className="text-xs text-muted-foreground">@{s.username}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs">
                                                        {getDeptName(s.department_id)} <br />
                                                        <span className="text-muted-foreground">{getYearName(s.academic_year_id)}</span>
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); }}
                                                            className="hover:bg-blue-500/10 hover:text-blue-500"
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); startEdit(s); }}
                                                            className="hover:bg-primary/10 hover:text-primary"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); deleteStudent(s.student_id); }}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
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

            {/* Student Detail Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) { setSelectedStudent(null); setSelectedGroup(null); } }}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    {!selectedGroup ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    Student Details
                                </DialogTitle>
                            </DialogHeader>
                            {selectedStudent && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 pb-4 border-b">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                            {selectedStudent.student_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedStudent.student_name}</h3>
                                            <p className="text-sm text-muted-foreground">ID: {selectedStudent.student_id}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="text-sm font-medium">{selectedStudent.email || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <p className="text-sm font-medium">{selectedStudent.phone || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Username</p>
                                            <p className="text-sm font-medium">@{selectedStudent.username || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Department</p>
                                            <p className="text-sm font-medium">{getDeptName(selectedStudent.department_id) || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Academic Year</p>
                                            <p className="text-sm font-medium">{getYearName(selectedStudent.academic_year_id) || '—'}</p>
                                        </div>
                                    </div>

                                    {/* Project Groups */}
                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <FolderGit2 className="h-4 w-4" /> Project Groups
                                        </h4>
                                        {groupLoading ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Loading groups...
                                            </div>
                                        ) : studentGroups.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">Not assigned to any group.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {studentGroups.map((g: any, i: number) => (
                                                    <div
                                                        key={`${g.project_group_id}-${i}`}
                                                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                                                        onClick={() => setSelectedGroup(g)}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <FolderGit2 className="h-4 w-4 text-primary shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium truncate">{g.group_name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{g.project_title || 'Untitled'}</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant={g.status === 'APPROVED' ? 'default' : 'secondary'} className="capitalize shrink-0 ml-2">
                                                            {g.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                                        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => { setSelectedStudent(null); startEdit(selectedStudent); }}>
                                            <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                                        </Button>
                                        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => { setSelectedStudent(null); startEdit(selectedStudent); }}>
                                            <LockIcon className="h-4 w-4 mr-2" /> Change Password
                                        </Button>
                                        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => setSelectedStudent(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Group Detail View */}
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedGroup(null)}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <FolderGit2 className="h-5 w-5 text-primary" />
                                    Group Details
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">{selectedGroup.group_name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedGroup.project_title || 'Untitled Project'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Project Area</p>
                                        <p className="text-sm font-medium">{selectedGroup.project_area || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Type</p>
                                        <p className="text-sm font-medium">{selectedGroup.project_type_name || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <Badge variant={selectedGroup.status === 'APPROVED' ? 'default' : 'secondary'} className="capitalize mt-1">
                                            {selectedGroup.status}
                                        </Badge>
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
                                {selectedGroup.project_description && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm bg-muted/20 p-3 rounded-md border">{selectedGroup.project_description}</p>
                                    </div>
                                )}
                                {selectedGroup.members && selectedGroup.members.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Users className="h-4 w-4" /> Members ({selectedGroup.members.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedGroup.members.map((m: any, idx: number) => (
                                                <div key={`${m.student_id}-${idx}`} className="flex items-center gap-3 p-2 rounded-md border bg-muted/20">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {m.student_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">
                                                            {m.student_name}
                                                            {m.is_leader === 1 && <Badge variant="default" className="text-[10px] px-1.5 py-0 ml-2">Leader</Badge>}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{m.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <Button variant="outline" className="w-full" onClick={() => setSelectedGroup(null)}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Student
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AuthGuard>
    );
}

