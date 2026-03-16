"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Clock, Plus, Users, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState<any>(null);
  const [formData, setFormData] = useState({
    project_group_id: "",
    meeting_datetime: "",
    meeting_purpose: "",
    meeting_status: "Scheduled",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const metRes = await fetch(`/api/meeting?staff_id=${user.staff_id}`);
        if (metRes.ok) setMeetings(await metRes.json());
        const grpRes = await fetch(`/api/staff/groups?staff_id=${user.staff_id}`);
        if (grpRes.ok) setGroups(await grpRes.json());
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setEditMeeting(null);
    setFormData({ project_group_id: "", meeting_datetime: "", meeting_purpose: "", meeting_status: "Scheduled" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (m: any) => {
    setEditMeeting(m);
    const dt = m.meeting_datetime ? new Date(m.meeting_datetime).toISOString().slice(0, 16) : "";
    setFormData({
      project_group_id: String(m.project_group_id),
      meeting_datetime: dt,
      meeting_purpose: m.meeting_purpose || "",
      meeting_status: m.meeting_status || "Scheduled",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);

      if (editMeeting) {
        // UPDATE
        const res = await fetch("/api/meeting", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meeting_id: editMeeting.meeting_id,
            meeting_datetime: formData.meeting_datetime,
            meeting_purpose: formData.meeting_purpose,
            meeting_status: formData.meeting_status,
          }),
        });
        if (!res.ok) { alert("Failed to update meeting."); return; }
      } else {
        // CREATE
        const res = await fetch("/api/meeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            guide_staff_id: user.staff_id,
          }),
        });
        if (!res.ok) { alert("Failed to schedule meeting."); return; }
      }

      setIsDialogOpen(false);
      setEditMeeting(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving meeting.");
    }
  };

  const handleDelete = async (meetingId: number) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const res = await fetch("/api/meeting", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_id: meetingId }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete meeting.");
      }
    } catch {
      alert("Error deleting meeting.");
    }
  };

  return (
    <AuthGuard>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Meetings</h2>
            <p className="text-muted-foreground">Schedule and manage meetings with your project groups.</p>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
          </Button>
        </div>

        {/* Schedule / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editMeeting ? "Edit Meeting" : "Schedule New Meeting"}</DialogTitle>
                <DialogDescription>
                  {editMeeting ? "Update the meeting details." : "Set up a meeting with one of your assigned project groups."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {!editMeeting && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="group" className="text-right">Group</Label>
                    <select
                      id="group"
                      required
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.project_group_id}
                      onChange={(e) => setFormData({ ...formData, project_group_id: e.target.value })}
                    >
                      <option value="">Select a group...</option>
                      {groups.map((g) => (
                        <option key={g.project_group_id} value={g.project_group_id}>
                          {g.group_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="datetime" className="text-right">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    required
                    className="col-span-3"
                    value={formData.meeting_datetime}
                    onChange={(e) => setFormData({ ...formData, meeting_datetime: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="purpose" className="text-right">Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g. Design Review"
                    required
                    className="col-span-3"
                    value={formData.meeting_purpose}
                    onChange={(e) => setFormData({ ...formData, meeting_purpose: e.target.value })}
                  />
                </div>
                {editMeeting && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <select
                      id="status"
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={formData.meeting_status}
                      onChange={(e) => setFormData({ ...formData, meeting_status: e.target.value })}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editMeeting ? "Save Changes" : "Schedule"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 lg:col-span-5 bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Upcoming & Past Meetings</CardTitle>
              <CardDescription>View your scheduled interactions with student groups.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Project Group</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                       <TableCell colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse">
                         Loading meetings...
                       </TableCell>
                     </TableRow>
                  ) : meetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No meetings scheduled yet. Click &quot;Schedule Meeting&quot; to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    meetings.map((m, i) => (
                      <TableRow key={`${m.meeting_id}-${i}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {new Date(m.meeting_datetime).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{m.group_name}</TableCell>
                        <TableCell>{m.meeting_purpose}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            m.meeting_status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            m.meeting_status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            m.meeting_status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {m.meeting_status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(m)}>
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(m.meeting_id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="col-span-3 lg:col-span-2 bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Pending Meetings</p>
                  <p className="text-2xl font-bold">{meetings.filter(m => m.meeting_status === 'Scheduled').length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Total Groups Assigned</p>
                  <p className="text-2xl font-bold">{groups.length || '--'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
