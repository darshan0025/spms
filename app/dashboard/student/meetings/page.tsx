"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const res = await fetch(`/api/student/meetings?student_id=${user.student_id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMeetings(data);
                }
            } catch (error) {
                console.error("Error fetching student meetings", error);
            }
        }
        setLoading(false);
    };
    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Project Meetings</h2>
                        <p className="text-muted-foreground">View upcoming meetings with your assigned faculty.</p>
                    </div>
                </div>

                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                    <CardHeader>
                        <CardTitle>Schedule</CardTitle>
                        <CardDescription>Upcoming interactions with staff and attendance record.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">Loading meetings...</div>
                        ) : meetings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Clear Schedule</h3>
                                <p className="text-sm max-w-sm">
                                    You have no upcoming meetings scheduled at this time.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Project Group</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Attendance Status</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {meetings.map((m) => (
                                        <TableRow key={m.meeting_id}>
                                            <TableCell className="font-medium">
                                                {new Date(m.meeting_datetime).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{m.group_name}</TableCell>
                                            <TableCell>{m.meeting_purpose}</TableCell>
                                            <TableCell>
                                                {m.is_present === 1 ? (
                                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Present</Badge>
                                                ) : m.is_present === 0 ? (
                                                    <Badge variant="destructive">Absent</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {m.meeting_status}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthGuard>
    );
}
