"use client";

import AdminLayout from "@/app/components/AdminLayout";
import AuthGuard from "@/app/components/AuthGuard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, FolderGit2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <AdminLayout>
        <header className="flex items-center justify-between space-y-2 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, Administrator. Here's what's happening today.</p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Projects"
            value="128"
            description="Active projects this semester"
            icon={FolderGit2}
            trend="+12%"
          />
          <StatsCard
            title="Active Staff"
            value="24"
            description="Professors and TAs logged in"
            icon={Users}
          />
          <StatsCard
            title="Pending Approvals"
            value="7"
            description="Projects awaiting review"
            icon={AlertCircle}
          />
          <StatsCard
            title="Completed"
            value="42"
            description="Projects successfully graded"
            icon={CheckCircle2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
          {/* Recent Activity */}
          <div className="col-span-4 rounded-xl border border-border/50 bg-background/60 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Recent Submissions</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Project Alpha-{i}</p>
                    <p className="text-sm text-muted-foreground">Updated by John Doe</p>
                  </div>
                  <div className="text-sm text-muted-foreground">2h ago</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="col-span-3 rounded-xl border border-border/50 bg-background/60 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="font-semibold leading-none tracking-tight mb-4">System Status</h3>
            <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              All systems operational
            </div>
            <p className="text-sm text-muted-foreground">
              Database backup completed successfully at 04:00 AM.
            </p>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}