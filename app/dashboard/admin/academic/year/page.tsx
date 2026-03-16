"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, X, Plus, CalendarRange } from "lucide-react";

export default function AcademicYearPage() {
    const [years, setYears] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    async function loadYears() {
        try {
            const res = await fetch("/api/academic/year");
            if (res.ok) setYears(await res.json());
        } catch (e) { }
    }

    async function saveYear() {
        if (!name) return;
        setLoading(true);

        const method = editingId ? "PUT" : "POST";
        const body = editingId ? { id: editingId, year_name: name } : { year_name: name };

        await fetch("/api/academic/year", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        cancelEdit();
        setLoading(false);
        loadYears();
    }

    async function deleteYear(id: number) {
        if (!confirm("Delete this academic year?")) return;
        await fetch("/api/academic/year", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        loadYears();
    }

    function startEdit(y: any) {
        setEditingId(y.academic_year_id);
        setName(y.year_name);
    }

    function cancelEdit() {
        setEditingId(null);
        setName("");
    }

    useEffect(() => {
        loadYears();
    }, []);

    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Academic Year Master</h2>
                        <p className="text-muted-foreground">Manage academic sessions.</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="md:col-span-1 h-fit border-border/50 bg-background/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Year" : "Add Year"}</CardTitle>
                            <CardDescription>e.g. "2023-2024"</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Year Name</Label>
                                <Input
                                    placeholder="2023-2024"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={saveYear} className="flex-1" disabled={loading}>
                                    {loading ? "Saving..." : (editingId ? "Update" : "Add Year")}
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
                            <CardTitle>Existing Years</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Year Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {years.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No academic years found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        years.map((y) => (
                                            <TableRow key={y.academic_year_id}>
                                                <TableCell className="font-medium text-muted-foreground">{y.academic_year_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarRange className="h-4 w-4 text-primary" />
                                                        {y.year_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => startEdit(y)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteYear(y.academic_year_id)} className="text-destructive">
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
