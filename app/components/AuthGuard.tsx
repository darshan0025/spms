"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const userRole = user.role?.toLowerCase(); // e.g. "admin", "staff", "student"

      // Extract the role from the current path: /dashboard/admin/... → "admin"
      const pathRole = pathname.match(/^\/dashboard\/(admin|staff|student)/)?.[1];

      if (pathRole && userRole !== pathRole) {
        setError(`Access Denied! You are logged in as "${user.role}" and cannot access the "${pathRole}" dashboard.`);
        setTimeout(() => {
          router.push(`/dashboard/${userRole}`);
        }, 2500);
        return;
      }

      setAuthorized(true);
    } catch {
      router.push("/login");
    }
  }, [pathname]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-background border border-destructive/50 rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-destructive">Unauthorized Access</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecting to your dashboard...</p>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-destructive rounded-full animate-[progress_2.5s_ease-in-out]" style={{ animation: "progress 2.5s ease-in-out forwards" }} />
          </div>
        </div>
        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return children;
}
