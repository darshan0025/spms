"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, X, Building2 } from "lucide-react";

export default function DepartmentPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    async function loadDepartments() {
        try {
            const res = await fetch("/api/academic/department");
            if (res.ok) setDepartments(await res.json());
        } catch (e) { }
    }

    async function saveDept() {
        if (!name) return;
        setLoading(true);

        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { id: editingId, department_name: name } : { department_name: name };

        await fetch("/api/academic/department", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        cancelEdit();
        setLoading(false);
        loadDepartments();
    }

    async function deleteDept(id: number) {
        if (!confirm("Delete this department?")) return;
        await fetch("/api/academic/department", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        loadDepartments();
    }

    function startEdit(d: any) {
        setEditingId(d.department_id);
        setName(d.department_name);
    }

    function cancelEdit() {
        setEditingId(null);
        setName("");
    }

    useEffect(() => {
        loadDepartments();
    }, []);

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Department Master</h2>
                        <p className="text-muted-foreground">Manage valid departments.</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="md:col-span-1 h-fit border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Dept" : "Add Dept"}</CardTitle>
                            <CardDescription>e.g. "Computer Science"</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Department Name</Label>
                                <Input
                                    placeholder="Computer Science"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={saveDept} className="flex-1" disabled={loading}>
                                    {loading ? "Saving..." : (editingId ? "Update" : "Add Dept")}
                                </Button>
                                {editingId && (
                                    <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Existing Departments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No departments found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        departments.map((d) => (
                                            <TableRow key={d.department_id}>
                                                <TableCell className="font-medium text-muted-foreground">{d.department_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                        {d.department_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => startEdit(d)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteDept(d.department_id)} className="text-destructive">
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
        </AuthGuard>
    );
}
