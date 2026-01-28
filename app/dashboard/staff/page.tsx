"use client";

import AuthGuard from "@/app/components/AuthGuard";
import StaffLayout from "@/app/components/StaffLayout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CheckSquare, Calendar, ClipboardCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StaffDashboard() {
  return (
    <AuthGuard>
      <StaffLayout>
        <header className="flex items-center justify-between space-y-2 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff Dashboard</h2>
            <p className="text-muted-foreground">Manage your academic responsibilities.</p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pending Approvals"
            value="5"
            description="Projects needing review"
            icon={CheckSquare}
            trend="Urgent"
          />
          <StatsCard
            title="Upcoming Meetings"
            value="2"
            description="Scheduled for today"
            icon={Calendar}
          />
          <StatsCard
            title="Attendance"
            value="98%"
            description="Student average this week"
            icon={ClipboardCheck}
            trend="+2%"
          />
          <StatsCard
            title="Office Hours"
            value="2PM"
            description="Next session starts soon"
            icon={Clock}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {/* Schedule / Timeline */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your upcoming events and deadlines.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "10:00 AM", title: "Project Review: Team Alpha", type: "Meeting" },
                  { time: "02:00 PM", title: "Office Hours", type: "General" },
                  { time: "04:00 PM", title: "Faculty Meeting", type: "Meeting" },
                ].map((event, i) => (
                  <div key={i} className="flex items-center border-l-4 border-primary pl-4 py-2 bg-muted/20 rounded-r-md">
                    <div className="w-24 text-sm font-bold text-muted-foreground">{event.time}</div>
                    <div>
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <span className="text-xs text-muted-foreground">{event.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Notifications */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm p-3 rounded-md bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                  <strong>Reminder:</strong> Submit mid-term grades by Friday.
                </div>
                <div className="text-sm p-3 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <strong>New Feature:</strong> You can now bulk approve attendance.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </StaffLayout>
    </AuthGuard>
  );
}
