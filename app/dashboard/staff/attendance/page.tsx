"use client";
import { useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import StaffLayout from "@/app/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function Attendance() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    alert("Attendance Saved");
  }

  return (
    <AuthGuard>
      <StaffLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
            <p className="text-muted-foreground">Mark student presence for scheduled sessions.</p>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <CardTitle>Mark Attendance</CardTitle>
              </div>
              <CardDescription>Enter the meeting details to record attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meeting ID</Label>
                  <Input
                    placeholder="e.g. 55"
                    onChange={(e) => setData({ ...data, meeting_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input
                    placeholder="e.g. STU-001"
                    onChange={(e) => setData({ ...data, student_id: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => setData({ ...data, is_present: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="1">Present</option>
                  <option value="0">Absent</option>
                </select>
              </div>

              <Button onClick={submit} className="w-full size-lg text-md" disabled={loading}>
                {loading ? "Saving..." : "Save Record"}
              </Button>
            </CardContent>
          </Card>
        </div>

      </StaffLayout>
    </AuthGuard>
  );
}
