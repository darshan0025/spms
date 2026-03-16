"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Users } from "lucide-react";

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reports/projects")
      .then(res => res.json())
      .then(setProjects)
      .catch(() => { }); // Silent fail for demo

    fetch("/api/reports/members")
      .then(res => res.json())
      .then(setMembers)
      .catch(() => { });
  }, []);

  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Reports</h2>
            <p className="text-muted-foreground">Comprehensive overview of projects, groups, and members.</p>
          </div>
        </div>

        {/* Projects Report */}
        <Card className="mb-8 border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              <CardTitle>Project Status Report</CardTitle>
            </div>
            <CardDescription>Real-time status of all student project submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No data available.</TableCell>
                  </TableRow>
                ) : (
                  projects.map((p) => (
                    <TableRow key={p.project_group_id}>
                      <TableCell className="font-medium">{p.group_name}</TableCell>
                      <TableCell>{p.project_title}</TableCell>
                      <TableCell>{p.project_type_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "APPROVED"
                              ? "default" // Primary color for approved
                              : p.status === "REJECTED"
                                ? "destructive"
                                : "secondary" // Gray/Warning for others
                          }
                          className="uppercase text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Members Report */}
        <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Group Allocation</CardTitle>
            </div>
            <CardDescription>Detailed list of students and their assigned groups.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No members found.</TableCell>
                  </TableRow>
                ) : (
                  members.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{m.group_name}</TableCell>
                      <TableCell>{m.student_name}</TableCell>
                      <TableCell>
                        {m.is_leader ? (
                          <Badge variant="outline" className="border-primary text-primary">Leader</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Member</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
