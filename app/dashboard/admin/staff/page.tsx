"use client";
import React, { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";

import { Select } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Mail, User, Pencil, X, Eye, EyeOff, Info, FolderGit2, ArrowLeft, Loader2, Users, Lock as LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffGroups, setStaffGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState<string>("");

  async function fetchStaffGroups(staffId: number) {
    setGroupLoading(true);
    try {
      const res = await fetch(`/api/staff/groups?staff_id=${staffId}`);
      if (res.ok) setStaffGroups(await res.json());
      else setStaffGroups([]);
    } catch { setStaffGroups([]); }
    setGroupLoading(false);
  }

  async function fetchGroupDetails(groupId: number) {
    try {
      const res = await fetch(`/api/project-group?group_id=${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedGroup(Array.isArray(data) ? data[0] : data);
      }
    } catch { }
  }

  useEffect(() => {
    if (selectedStaff) {
      fetchStaffGroups(selectedStaff.staff_id);
      setSelectedGroup(null);
    } else {
      setStaffGroups([]);
      setSelectedGroup(null);
    }
  }, [selectedStaff]);

  async function loadDepartments() {
    try {
      const res = await fetch("/api/academic/department");
      if (res.ok) setDepartments(await res.json());
    } catch (e) { }
  }

  async function loadStaff() {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) setStaff(await res.json());
    } catch (e) { }
  }

  async function saveStaff() {
    if (!name || !email) return;
    setLoading(true);

    const method = editingId ? "PUT" : "POST";
    const parsedDeptId = departmentId && departmentId !== "unassigned" ? parseInt(departmentId) : null;
    const body = editingId
      ? { staff_id: editingId, staff_name: name, email, username, password, department_id: parsedDeptId }
      : { staff_name: name, email, username, password, department_id: parsedDeptId };

    const res = await fetch("/api/staff", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Error: " + err.error);
      setLoading(false);
      return;
    }

    cancelEdit();
    setLoading(false);
    loadStaff();
  }

  async function deleteStaff(id: number) {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    const res = await fetch("/api/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_id: id })
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Error deleting staff: " + err.error);
      return;
    }

    loadStaff();
  }

  function startEdit(s: any) {
    setEditingId(s.staff_id);
    setName(s.staff_name);
    setEmail(s.email);
    setUsername(s.username || "");
    setPassword(""); // Clear password field for editing
    setDepartmentId(s.department_id ? String(s.department_id) : "unassigned");
    document.getElementById("staff-form")?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setDepartmentId("");
  }

  useEffect(() => {
    loadDepartments();
    loadStaff();
  }, []);

  const groupedStaff = staff.reduce((acc, curr) => {
    const dept = curr.department_name || "Unassigned";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
            <p className="text-muted-foreground">Add and manage teaching staff and administrators.</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Add/Edit Form */}
          <Card id="staff-form" className="md:col-span-1 h-fit border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Staff" : "Register New Staff"}</CardTitle>
              <CardDescription>
                {editingId ? "Update staff details." : "Grant access to a new faculty member."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={departmentId} 
                  onChange={setDepartmentId}
                  placeholder="Select a department"
                  options={[
                    { label: "Unassigned", value: "unassigned" },
                    ...departments.map((d) => ({ label: d.department_name, value: String(d.department_id) }))
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    className="pl-9"
                    placeholder="john@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="johndoe123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password {editingId && <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep current)</span>}</Label>
                <div className="relative">
                  <X className="absolute left-3 top-3 h-4 w-4 text-muted-foreground hidden" /> {/* Placeholder icon to match layout align */}
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <div className="flex gap-2 pt-2">
                <Button onClick={saveStaff} className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? "Update Staff" : "Register Staff")}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* List Table */}
          <Card className="md:col-span-2 border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email / Username</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(groupedStaff).sort().map(([deptName, deptStaff]: [string, any]) => (
                      <React.Fragment key={deptName}>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={4} className="font-semibold text-muted-foreground">
                            {deptName}
                          </TableCell>
                        </TableRow>
                        {deptStaff.map((s: any) => (
                          <TableRow key={s.staff_id} className="cursor-pointer" onClick={() => setSelectedStaff(s)}>
                            <TableCell>
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {s.staff_name.charAt(0)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <span className="hover:underline text-primary">{s.staff_name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{s.email}</span>
                              <br />
                              <span className="text-xs text-muted-foreground">@{s.username}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => { e.stopPropagation(); setSelectedStaff(s); }}
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
                                  onClick={(e) => { e.stopPropagation(); deleteStaff(s.staff_id); }}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staff Detail Dialog */}
      <Dialog open={!!selectedStaff} onOpenChange={(open) => { if (!open) { setSelectedStaff(null); setSelectedGroup(null); } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {!selectedGroup ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Staff Details
                </DialogTitle>
              </DialogHeader>
              {selectedStaff && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                      {selectedStaff.staff_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedStaff.staff_name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {selectedStaff.staff_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{selectedStaff.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="text-sm font-medium">@{selectedStaff.username || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{selectedStaff.department_name || 'Unassigned'}</p>
                    </div>
                  </div>

                  {/* Associated Project Groups */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4" /> Associated Projects
                    </h4>
                    {groupLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading groups...
                      </div>
                    ) : staffGroups.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Not associated with any project group.</p>
                    ) : (
                      <div className="space-y-2">
                        {staffGroups.map((g: any, i: number) => {
                          const roles: string[] = [];
                          if (g.guide_staff_id == selectedStaff.staff_id) roles.push('Guide');
                          if (g.convener_staff_id == selectedStaff.staff_id) roles.push('Convener');
                          if (g.expert_staff_id == selectedStaff.staff_id) roles.push('Expert');
                          return (
                            <div
                              key={`${g.project_group_id}-${i}`}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                              onClick={() => fetchGroupDetails(g.project_group_id)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FolderGit2 className="h-4 w-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{g.group_name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{g.project_title || 'Untitled'}</p>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0 ml-2">
                                {roles.map(r => (
                                  <Badge key={r} variant={r === 'Guide' ? 'default' : 'secondary'} className="text-[10px] px-1.5">
                                    {r}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => { setSelectedStaff(null); startEdit(selectedStaff); }}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => { setSelectedStaff(null); startEdit(selectedStaff); }}>
                      <LockIcon className="h-4 w-4 mr-2" /> Change Password
                    </Button>
                    <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => setSelectedStaff(null)}>
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
                      {selectedGroup.status || '—'}
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
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Staff
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
