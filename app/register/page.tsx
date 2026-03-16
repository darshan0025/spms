"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  const [form, setForm] = useState({
    student_name: "",
    email: "",
    phone_no: "",
    username: "",
    password: "",
    confirm_password: "",
    department_id: "",
    academic_year_id: "",
  });

  useEffect(() => {
    fetch("/api/academic/department").then(r => r.json()).then(setDepartments).catch(() => {});
    fetch("/api/academic/year").then(r => r.json()).then(setAcademicYears).catch(() => {});
  }, []);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client validations
    if (!form.student_name.trim()) { setError("Name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (!form.phone_no.trim()) { setError("Phone number is required."); return; }
    if (!form.username.trim()) { setError("Username is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm_password) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: form.student_name,
          email: form.email,
          phone_no: form.phone_no,
          username: form.username,
          password: form.password,
          department_id: form.department_id || null,
          academic_year_id: form.academic_year_id || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess(data.message || "Registration successful!");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const inputClass = "bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 focus-visible:ring-offset-0";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black flex items-center justify-center">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-black/5 dark:bg-white/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-black/5 dark:bg-white/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl bg-white/70 backdrop-blur-xl border-white/20 dark:bg-black/70 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-center">
            Register as a student to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-500 text-center bg-red-50 p-2 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-600 text-center bg-green-50 p-2 rounded-md border border-green-200 dark:bg-green-900/20 dark:border-green-800">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="John Doe" value={form.student_name} onChange={(e) => updateForm("student_name", e.target.value)} disabled={loading} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={(e) => updateForm("email", e.target.value)} disabled={loading} required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" placeholder="+91 98765 43210" value={form.phone_no} onChange={(e) => updateForm("phone_no", e.target.value)} disabled={loading} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input id="username" placeholder="johndoe" value={form.username} onChange={(e) => updateForm("username", e.target.value)} disabled={loading} required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => updateForm("password", e.target.value)} disabled={loading} required className={inputClass} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password *</Label>
                <Input id="confirm" type="password" placeholder="••••••••" value={form.confirm_password} onChange={(e) => updateForm("confirm_password", e.target.value)} disabled={loading} required className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <select
                  id="dept"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${inputClass}`}
                  value={form.department_id}
                  onChange={(e) => updateForm("department_id", e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select...</option>
                  {departments.map((d: any) => (
                    <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <select
                  id="year"
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${inputClass}`}
                  value={form.academic_year_id}
                  onChange={(e) => updateForm("academic_year_id", e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select...</option>
                  {academicYears.map((y: any) => (
                    <option key={y.academic_year_id} value={y.academic_year_id}>{y.year_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button className="w-full transition-all hover:scale-[1.02] shadow-lg" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
