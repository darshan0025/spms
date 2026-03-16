"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Filter } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function AttendancePage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (selectedMeeting) {
      fetchStudents(selectedMeeting);
    } else {
      setStudents([]);
    }
  }, [selectedMeeting]);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // We only want to show meetings assigned to this staff
        // we can reuse the existing GET /api/meeting
        const res = await fetch(`/api/meeting?staff_id=${user.staff_id}`);
        if (res.ok) {
          const data = await res.json();
          setMeetings(data);
        }
      } catch (error) {
        console.error("Error fetching meetings", error);
      }
    }
    setLoadingMeetings(false);
  };

  const fetchStudents = async (meetingId: string) => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/attendance/group?meeting_id=${meetingId}`);
      if (res.ok) {
        const data = await res.json();
        // pre-process to ensure all have is_present (default true if null)
        const processed = data.map((s: any) => ({
           ...s,
           is_present: s.is_present === null ? true : s.is_present === 1
        }));
        setStudents(processed);
      }
    } catch (error) {
      console.error("Error fetching students", error);
    }
    setLoadingStudents(false);
  };

  const handlePresenceChange = (studentId: number, checked: boolean) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, is_present: checked } : s));
  };

  const handleRemarksChange = (studentId: number, remark: string) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, remarks: remark } : s));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const payload = {
         meeting_id: parseInt(selectedMeeting),
         attendance_records: students
      };
      const res = await fetch("/api/attendance/group", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
      });
      if (res.ok) {
         alert("Attendance saved successfully!");
      } else {
         alert("Failed to save attendance.");
      }
    } catch (error) {
      console.error("Error saving attendance", error);
      alert("Error saving attendance");
    }
    setSaving(false);
  };
  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meeting Attendance</h2>
            <p className="text-muted-foreground">Track and record student attendance for project meetings.</p>
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter by Group
          </Button>
        </div>

        <Card className="bg-background/60 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>Select a recent meeting to log or review attendance.</CardDescription>
            <div className="mt-4 max-w-sm">
                <Select 
                    value={selectedMeeting} 
                    onChange={setSelectedMeeting}
                    placeholder={loadingMeetings ? "Loading..." : "Select Meeting"}
                    options={meetings.map(m => ({
                        label: `${m.group_name} - ${new Date(m.meeting_datetime).toLocaleString()}`,
                        value: String(m.meeting_id)
                    }))}
                />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!selectedMeeting ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                          <p>No meeting selected. Please select a meeting to begin logging attendance.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : loadingStudents ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">Loading students...</TableCell>
                     </TableRow>
                  ) : students.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">No students found in this group.</TableCell>
                     </TableRow>
                  ) : (
                     students.map(s => (
                        <TableRow key={s.student_id}>
                           <TableCell className="font-medium">{s.student_name}</TableCell>
                           <TableCell>{s.email}</TableCell>
                           <TableCell>
                                <Switch 
                                    checked={s.is_present} 
                                    onCheckedChange={(c) => handlePresenceChange(s.student_id, c)} 
                                />
                           </TableCell>
                           <TableCell>
                                <Input 
                                    placeholder="Optional remarks" 
                                    value={s.remarks || ""} 
                                    onChange={(e) => handleRemarksChange(s.student_id, e.target.value)} 
                                />
                           </TableCell>
                        </TableRow>
                     ))
                  )}
                </TableBody>
              </Table>
            </div>
            {selectedMeeting && students.length > 0 && (
                <div className="mt-4 flex justify-end">
                    <Button onClick={saveAttendance} disabled={saving}>
                        {saving ? "Saving..." : "Save Attendance"}
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
