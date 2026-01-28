"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import StudentLayout from "@/app/components/StudentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

export default function CreateProject() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    group_name: "",
    project_title: "",
    project_area: "",
    project_description: "",
    project_type_id: "",
    members: [],
  });

  useEffect(() => {
    fetch("/api/project-type")
      .then((res) => res.json())
      .then(setTypes);
  }, []);

  function addMember() {
    setForm({
      ...form,
      members: [...form.members, { student_id: "", is_leader: 0 }],
    });
  }

  function removeMember(index: number) {
    const updated = [...form.members];
    updated.splice(index, 1);
    setForm({ ...form, members: updated });
  }

  async function submit() {
    setLoading(true);
    await fetch("/api/project-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    alert("Project Group Created");
    window.location.href = "/dashboard/student";
  }

  return (
    <AuthGuard>
      <StudentLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">New Project</h2>
            <p className="text-muted-foreground">Register your project group and topic.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Enter the core information about your proposed project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    placeholder="e.g. Alpha Squad"
                    onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => setForm({ ...form, project_type_id: e.target.value })}
                  >
                    <option>Select Type...</option>
                    {types.map((t) => (
                      <option key={t.project_type_id} value={t.project_type_id}>
                        {t.project_type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Title</Label>
                <Input
                  placeholder="e.g. AI-based Traffic Management System"
                  onChange={(e) => setForm({ ...form, project_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Project Area / Domain</Label>
                <Input
                  placeholder="e.g. Machine Learning, IoT"
                  onChange={(e) => setForm({ ...form, project_area: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Brief abstract of the project..."
                  onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Group Members</h3>
                  <Button variant="outline" size="sm" onClick={addMember}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.members.map((m: any, i: number) => (
                    <div key={i} className="flex items-end gap-4 p-4 border rounded-lg bg-muted/20">
                      <div className="flex-1 space-y-2">
                        <Label>Student ID</Label>
                        <Input
                          placeholder="e.g. STU-101"
                          onChange={(e) => {
                            const members = [...form.members];
                            members[i].student_id = e.target.value;
                            setForm({ ...form, members });
                          }}
                        />
                      </div>
                      <div className="flex items-center h-10 pb-2">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            onChange={(e) => {
                              const members = [...form.members];
                              members[i].is_leader = e.target.checked ? 1 : 0;
                              setForm({ ...form, members });
                            }}
                          />
                          Is Leader?
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => removeMember(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {form.members.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 italic">
                      No members added yet. Click "Add Member" to begin.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={submit} size="lg" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
                  {loading ? "Submitting..." : "Submit Project Proposal"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    </AuthGuard>
  );
}
