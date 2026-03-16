"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  Users,
  BarChart3,
  TrendingUp,
  Loader2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
const STATUS_COLORS: Record<string, string> = {
  "PENDING": "#eab308",
  "IN PROGRESS": "#3b82f6",
  "COMPLETED": "#22c55e",
  "CANCELLED": "#ef4444",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) setStats(await res.json());
      } catch { }
      setLoading(false);
    }
    load();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-500/10 text-emerald-500";
      case "IN PROGRESS": return "bg-blue-500/10 text-blue-500";
      case "CANCELLED": return "bg-red-500/10 text-red-500";
      default: return "bg-yellow-500/10 text-yellow-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "IN PROGRESS": return <Clock className="h-4 w-4 text-blue-500" />;
      case "CANCELLED": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const pendingCount = stats?.statusBreakdown?.["PENDING"] || 0;
  const inProgressCount = stats?.statusBreakdown?.["IN PROGRESS"] || 0;
  const completedCount = stats?.statusBreakdown?.["COMPLETED"] || 0;
  const cancelledCount = stats?.statusBreakdown?.["CANCELLED"] || 0;

  // Pie chart data for status
  const statusPieData = stats ? Object.entries(stats.statusBreakdown || {}).map(([name, value]) => ({
    name,
    value: value as number,
  })) : [];

  // Pie chart data for project types
  const typePieData = (stats?.typeBreakdown || []).filter((t: any) => t.count > 0);

  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading dashboard...
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* ==================== OVERVIEW TAB ==================== */}
            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalGroups ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {inProgressCount} in progress
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStudents ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Enrolled students
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStaff ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Faculty members
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Requires action
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart + Recent */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Projects by Department</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={stats?.deptGroups || []}>
                        <XAxis
                          dataKey="department_name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" name="Projects" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Project Groups</CardTitle>
                    <CardDescription>Latest added projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {(stats?.recentGroups || []).map((g: any) => (
                        <div key={g.project_group_id} className="flex items-center">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FolderGit2 className="h-4 w-4" />
                          </div>
                          <div className="ml-4 space-y-1 min-w-0 flex-1">
                            <p className="text-sm font-medium leading-none truncate">{g.project_title || g.group_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{g.department_name || 'No Dept'}</p>
                          </div>
                          <Badge className={`ml-2 shrink-0 capitalize ${getStatusStyle(g.status)}`} variant="secondary">
                            {g.status || 'PENDING'}
                          </Badge>
                        </div>
                      ))}
                      {(!stats?.recentGroups || stats.recentGroups.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No projects yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ==================== ANALYTICS TAB ==================== */}
            <TabsContent value="analytics" className="space-y-4">
              {/* Status Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">{inProgressCount}</div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-500">{completedCount}</div>
                    <p className="text-xs text-muted-foreground">Successfully finished</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{cancelledCount}</div>
                    <p className="text-xs text-muted-foreground">Discontinued</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" /> Project Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-12">No data available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Students by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats?.deptStudents || []} layout="vertical">
                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="department_name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Project Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {(stats?.typeBreakdown || []).map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                          {t.count}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.project_type_name}</p>
                          <p className="text-xs text-muted-foreground">{t.count} project{t.count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ==================== REPORTS TAB ==================== */}
            <TabsContent value="reports" className="space-y-4">
              {/* Department Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Department-wise Report</CardTitle>
                  <CardDescription>Projects and students per department</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-center">Projects</TableHead>
                        <TableHead className="text-center">Students</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(stats?.deptGroups || []).map((d: any, i: number) => {
                        const studentCount = (stats?.deptStudents || []).find((s: any) => s.department_name === d.department_name)?.count || 0;
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{d.department_name}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{d.count}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{studentCount}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!stats?.deptGroups || stats.deptGroups.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No data.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Status Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Summary</CardTitle>
                  <CardDescription>Breakdown of all project statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Pending", count: pendingCount, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                      { label: "In Progress", count: inProgressCount, color: "text-blue-500", bg: "bg-blue-500/10" },
                      { label: "Completed", count: completedCount, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                      { label: "Cancelled", count: cancelledCount, color: "text-red-500", bg: "bg-red-500/10" },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center gap-3 p-4 rounded-lg border ${item.bg}`}>
                        {getStatusIcon(item.label.toUpperCase())}
                        <div>
                          <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Projects Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Project Groups</CardTitle>
                  <CardDescription>Complete list of all project groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Project Title</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(stats?.recentGroups || []).map((g: any) => (
                        <TableRow key={g.project_group_id}>
                          <TableCell className="font-medium">{g.group_name || '—'}</TableCell>
                          <TableCell>{g.project_title || '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{g.project_area || '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{g.department_name || '—'}</TableCell>
                          <TableCell>
                            <Badge className={`capitalize ${getStatusStyle(g.status)}`} variant="secondary">
                              {g.status || 'PENDING'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Type Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Type Report</CardTitle>
                  <CardDescription>Number of projects by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Type</TableHead>
                        <TableHead className="text-center">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(stats?.typeBreakdown || []).map((t: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{t.project_type_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{t.count}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AuthGuard>
  );
}