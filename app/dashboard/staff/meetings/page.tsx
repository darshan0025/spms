"use client";
import { useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import StaffLayout from "@/app/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function ScheduleMeeting() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    alert("Meeting Scheduled");
  }

  return (
    <AuthGuard>
      <StaffLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meeting Scheduler</h2>
            <p className="text-muted-foreground">Book time with project groups or colleagues.</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Scheduler Form */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl h-fit">
            <CardHeader>
              <CardTitle>Schedule New Meeting</CardTitle>
              <CardDescription>Fill out the details below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Group ID</Label>
                <Input
                  placeholder="e.g. 101"
                  onChange={(e) => setData({ ...data, project_group_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Staff ID (Self)</Label>
                <Input
                  placeholder="e.g. ST-05"
                  onChange={(e) => setData({ ...data, guide_staff_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => setData({ ...data, meeting_datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  placeholder="e.g. Code Review"
                  onChange={(e) => setData({ ...data, meeting_purpose: e.target.value })}
                />
              </div>

              <Button onClick={submit} className="w-full" disabled={loading}>
                {loading ? "Scheduling..." : "Confirm Meeting"}
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming List (Mock) */}
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for no meetings */}
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                  <CalendarIcon className="h-10 w-10 mb-2 opacity-50" />
                  <p>No upcoming meetings found.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaffLayout>
    </AuthGuard>
  );
}
