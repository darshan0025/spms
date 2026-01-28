"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[20%] h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <span>🚀 Version 2.0 is live</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Manage Student Projects <br /> Like a Pro.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            The ultimate platform for universities to track, grade, and organize student projects.
            Streamlined workflow for professors, automated insights for admins.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Start Managing Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/50 hover:bg-background/80">
              View Demo
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-32 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Secure & Reliable",
              desc: "Enterprise-grade encryption ensures your student data and grades remain confidential and safe.",
              color: "text-blue-500"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Built on Next.js 15 for instant page loads and real-time updates. No more waiting.",
              color: "text-yellow-500"
            },
            {
              icon: BarChart3,
              title: "Smart Analytics",
              desc: "Get detailed insights into project completion rates, class performance, and more.",
              color: "text-purple-500"
            }
          ].map((feature, i) => (
            <Card key={i} className="group overflow-hidden border-border/50 bg-white/40 dark:bg-black/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:bg-white/60 dark:hover:bg-black/60">
              <CardHeader>
                <feature.icon className={`h-12 w-12 ${feature.color} mb-2 transition-transform group-hover:scale-110`} />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-white/30 dark:bg-black/30 backdrop-blur-lg">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row md:py-6 px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <span className="font-semibold text-foreground">Antigravity</span>. The source code is available on <a href="#" className="underline hover:text-primary">GitHub</a>.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
