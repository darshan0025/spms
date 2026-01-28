"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import AdminLayout from "@/app/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FolderPen, Pencil, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectTypePage() {
  const [types, setTypes] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadTypes() {
    try {
      const res = await fetch("/api/project-type");
      if (res.ok) setTypes(await res.json());
    } catch (e) {
      console.error("Failed to load types");
    }
  }

  async function saveType() {
    if (!name) return;
    setLoading(true);

    const method = editingId ? "PUT" : "POST";
    const body = editingId
      ? { project_type_id: editingId, project_type_name: name, description }
      : { project_type_name: name, description };

    await fetch("/api/project-type", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    cancelEdit();
    setLoading(false);
    loadTypes();
  }

  async function deleteType(id: number) {
    if (!confirm("Are you sure you want to delete this type?")) return;

    await fetch("/api/project-type", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_type_id: id })
    });
    loadTypes();
  }

  function startEdit(type: any) {
    setEditingId(type.project_type_id);
    setName(type.project_type_name);
    setDescription(type.description || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  useEffect(() => {
    loadTypes();
  }, []);

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Types</h2>
            <p className="text-muted-foreground">Manage the definition of project categories.</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Add/Edit Form */}
          <Card className="md:col-span-1 h-fit bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Type" : "Add New Type"}</CardTitle>
              <CardDescription>
                {editingId ? "Update existing category details." : "Create a new category for student projects."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Type Name (e.g. Major)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Description (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveType} className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? <><FolderPen className="mr-2 h-4 w-4" /> Update</> : <><Plus className="mr-2 h-4 w-4" /> Add Type</>)}
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
          <Card className="md:col-span-2 bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Existing Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No project types found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    types.map((t) => (
                      <TableRow key={t.project_type_id}>
                        <TableCell className="font-medium">{t.project_type_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FolderPen className="h-4 w-4 text-primary" />
                            {t.project_type_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{t.description || "-"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t.updated_at ? new Date(t.updated_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(t)}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteType(t.project_type_id)}
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
      </AdminLayout>
    </AuthGuard>
  );
}
