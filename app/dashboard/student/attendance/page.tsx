"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AttendancePage() {
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
                    setMeetings(await res.json());
                }
            } catch (error) {
                console.error("Error fetching meetings", error);
            }
        }
        setLoading(false);
    };

    // Calculate attendance percentage
    // Only count meetings that have passed and have some attendance recorded (either 1 or 0)
    // Actually, any meeting where `is_present` is not null means attendance was taken.
    const attendedMeetings = meetings.filter(m => m.is_present === 1).length;
    const totalTakenMeetings = meetings.filter(m => m.is_present !== null).length;
    
    // Default to 100% if no meetings have had attendance taken yet
    const attendancePercentage = totalTakenMeetings === 0 
        ? 100 
        : Math.round((attendedMeetings / totalTakenMeetings) * 100);
    return (
        <AuthGuard>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
                        <p className="text-muted-foreground">Review your attendance record for project meetings.</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Summary Card */}
                    <Card className="md:col-span-1 border-border/50 bg-background/60 backdrop-blur-xl h-fit">
                        <CardHeader>
                            <CardTitle>Attendance Overview</CardTitle>
                            <CardDescription>Your cumulative attendance score.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
                            {loading ? (
                                <p className="text-muted-foreground">Loading...</p>
                            ) : (
                                <>
                                    <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-muted">
                                        <div className="absolute inset-0 rounded-full border-8 border-primary" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${attendancePercentage}%, 0 ${attendancePercentage}%)`, opacity: 0.2 }} />
                                        <span className="text-3xl font-bold text-primary">{attendancePercentage}%</span>
                                    </div>
                                    
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Classes Attended</span>
                                            <span className="font-medium">{attendedMeetings} / {totalTakenMeetings}</span>
                                        </div>
                                        <Progress value={attendancePercentage} className="h-2" />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        *Percentage is calculated based only on meetings where attendance has been marked by faculty.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card className="md:col-span-2 bg-background/60 backdrop-blur-xl border-border/50">
                        <CardHeader>
                            <CardTitle>Attendance History</CardTitle>
                            <CardDescription>Detailed record of your logged presence.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">Loading history...</div>
                            ) : meetings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <ClipboardList className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">No Records</h3>
                                    <p className="text-sm max-w-sm">
                                        Your attendance has not been logged for any meetings yet.
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {meetings.map((m) => (
                                            <TableRow key={m.meeting_id}>
                                                <TableCell className="font-medium">
                                                    {new Date(m.meeting_datetime).toLocaleString()}
                                                </TableCell>
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
                                                <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate" title={m.attendance_remarks || ""}>
                                                    {m.attendance_remarks || "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
}
