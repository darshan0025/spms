"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import StaffLayout from "@/app/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

export default function StaffProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/staff/projects");
      if (res.ok) setProjects(await res.json());
    } catch (e) { }
  }

  async function updateStatus(id: number, status: string) {
    setLoading(true); // Ideally track per-row loading
    await fetch("/api/staff/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_group_id: id, status }),
    });
    setLoading(false);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AuthGuard>
      <StaffLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Approvals</h2>
            <p className="text-muted-foreground">Review and approve student project proposals.</p>
          </div>
        </div>

        <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Pending Proposals</CardTitle>
            <CardDescription>A list of projects awaiting your decision.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No pending proposals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((p) => (
                    <TableRow key={p.project_group_id}>
                      <TableCell className="font-medium">{p.group_name}</TableCell>
                      <TableCell>{p.project_title}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'APPROVED' ? 'default' : (p.status === 'REJECTED' ? 'destructive' : 'secondary')}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {p.status !== 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(p.project_group_id, "APPROVED")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-1 h-4 w-4" /> Approve
                          </Button>
                        )}
                        {p.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(p.project_group_id, "REJECTED")}
                          >
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </StaffLayout>
    </AuthGuard>
  );
}
