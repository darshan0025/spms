"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

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

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      const user = await res.json();

      // ✅ SAVE LOGIN SESSION
      localStorage.setItem("user", JSON.stringify(user));

      router.push(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[100px]" />
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
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10 focus-visible:ring-offset-0"
              />
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
          <p className="text-xs text-muted-foreground text-center">
            Protected by enterprise-grade security.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}