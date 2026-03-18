"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Login() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (searchParams.get("reason") === "student_logout") {
      setShowLogoutDialog(true);
      localStorage.removeItem("user");
    }
  }, [searchParams]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student"); // Default role
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }), // Send selected role
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Store basic user info for UI (greeting/role), but NOT sensitive auth tokens
      // Auth is now handled by HttpOnly cookie
      // Store basic user info for UI
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login successful, redirecting to:", data.user.role);

      console.log("Login successful, redirecting to:", data.user.role);

      // Seamless navigation using Next.js router
      router.refresh(); // Update server components
      router.push(`/dashboard/${data.user.role.toLowerCase()}`);

      // Stop loading
      setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      {/* Background Gradients - Replaced with monochrome */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black flex items-center justify-center">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-black/5 dark:bg-white/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-black/5 dark:bg-white/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <Card className="w-full max-w-sm shadow-2xl bg-white/70 backdrop-blur-xl border-white/20 dark:bg-black/70 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-500 text-center bg-red-50 p-2 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            <Button
              type="button"
              variant={role === "Admin" ? "default" : "outline"}
              onClick={() => setRole("Admin")}
              className="w-full"
            >
              Admin
            </Button>
            <Button
              type="button"
              variant={role === "Staff" ? "default" : "outline"}
              onClick={() => setRole("Staff")}
              className="w-full"
            >
              Staff
            </Button>
            <Button
              type="button"
              variant={role === "Student" ? "default" : "outline"}
              onClick={() => setRole("Student")}
              className="w-full"
            >
              Student
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 focus-visible:ring-offset-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full transition-all hover:scale-[1.02] shadow-lg" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">Register as Student</Link>
          </p>
        </CardFooter>
      </Card>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle className="text-xl">Notification</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              You logout as student then relogin
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-24"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}