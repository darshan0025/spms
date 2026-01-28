"use client";

import AuthGuard from "@/app/components/AuthGuard";
import StudentLayout from "@/app/components/StudentLayout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PlusCircle, FileText, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentDashboard() {
  return (
    <AuthGuard>
      <StudentLayout>
        <header className="flex items-center justify-between space-y-2 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
            <p className="text-muted-foreground">Manage your project milestones.</p>
          </div>
          <Link href="/dashboard/student/create-project">
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </Link>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Project Status"
            value="Pending"
            description="Waiting for staff approval"
            icon={FileText}
          />
          <StatsCard
            title="Next Deadline"
            value="Fri, 12th"
            description="Synopsis Submission"
            icon={Clock}
            trend="3 days left"
          />
          <StatsCard
            title="Team Members"
            value="4"
            description="Active contributors"
            icon={CheckCircle2}
          />
          <StatsCard
            title="Total Commits"
            value="12"
            description="Codebase activity"
            icon={FileText}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {/* Welcome / Quick Start */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl md:col-span-2">
            <CardHeader>
              <CardTitle>Welcome to SPMS!</CardTitle>
              <CardDescription>Get started with your final year project journey.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                <h3 className="text-lg font-semibold mb-2">No Project Group Found?</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  It seems you haven't joined or created a project group yet. Create a new group to start submitting your proposals.
                </p>
                <Link href="/dashboard/student/create-project">
                  <Button size="lg" className="bg-primary/90 hover:bg-primary">
                    Create New Group
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

      </StudentLayout>
    </AuthGuard>
  );
}