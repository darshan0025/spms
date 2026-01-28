"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/app/components/AuthGuard";
import AdminLayout from "@/app/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, Mail, User } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStaff() {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) setStaff(await res.json());
    } catch (e) { }
  }

  async function addStaff() {
    if (!name || !email) return;
    setLoading(true);
    await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_name: name, email }),
    });
    setName("");
    setEmail("");
    setLoading(false);
    loadStaff();
  }

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
            <p className="text-muted-foreground">Add and manage teaching staff and administrators.</p>
          </div>
          <Button onClick={() => document.getElementById("staff-form")?.scrollIntoView({ behavior: "smooth" })}>
            <Plus className="mr-2 h-4 w-4" /> Add New Staff
          </Button>
        </div>

        {/* Staff Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {staff.map((s) => (
            <Card key={s.staff_id} className="group overflow-hidden border-border/50 bg-background/60 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {s.staff_name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-lg">{s.staff_name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {s.email}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="bg-muted/30 p-2 px-6">
                <div className="text-xs text-muted-foreground w-full text-center">
                  Role: Staff Member
                </div>
              </CardFooter>
            </Card>
          ))}
          {staff.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No staff members found. Add one below.
            </div>
          )}
        </div>

        {/* Add Staff Form */}
        <div id="staff-form" className="max-w-2xl mx-auto">
          <Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Register New Staff</CardTitle>
              <CardDescription>Grant access to a new faculty member.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="john@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={addStaff} className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register Staff"}
              </Button>
            </CardContent>
          </Card>
        </div>

      </AdminLayout>
    </AuthGuard>
  );
}
