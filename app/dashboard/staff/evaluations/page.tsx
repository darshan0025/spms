"use client";
import React, { useState, useEffect } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EvaluationsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [marks, setMarks] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Fetch groups
        const grpRes = await fetch(`/api/staff/groups?staff_id=${user.staff_id}`);
        if (grpRes.ok) {
          setGroups(await grpRes.json());
        }
        // Fetch previous evaluations
        const evalsRes = await fetch(`/api/staff/evaluations?staff_id=${user.staff_id}`);
        if (evalsRes.ok) {
           setEvaluations(await evalsRes.json());
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }
    setLoading(false);
  };

  const saveEvaluation = async () => {
    if (!selectedGroup || !marks) return;
    setSaving(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const res = await fetch("/api/staff/evaluations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_group_id: parseInt(selectedGroup),
            staff_id: user.staff_id,
            marks: parseInt(marks),
            feedback: feedback
          })
        });
        if (res.ok) {
          alert("Evaluation saved successfully!");
          setSelectedGroup("");
          setMarks("");
          setFeedback("");
          fetchData(); // refresh
        }
      } catch (error) {
        console.error("Error saving evaluation", error);
        alert("Failed to save evaluation.");
      }
    }
    setSaving(false);
  };

  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Evaluations</h2>
            <p className="text-muted-foreground">Submit marks and feedback for assigned project groups.</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-1 h-fit border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Submit Evaluation</CardTitle>
              <CardDescription>Enter grading details for a group.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Project Group</label>
                <Select
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  placeholder="Select a group..."
                  options={groups.map(g => ({ label: g.group_name, value: String(g.project_group_id) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Marks (Out of 100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g. 85"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Feedback/Remarks</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={saveEvaluation} disabled={saving || !selectedGroup || !marks} className="w-full">
                {saving ? "Saving..." : "Submit Evaluation"}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Previous Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                     </TableRow>
                  ) : evaluations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No previous evaluations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    evaluations.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {new Date(e.evaluated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{e.group_name}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">{e.marks}/100</span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={e.feedback}>
                           {e.feedback || "No feedback provided"}
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
