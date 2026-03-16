"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Zap, BarChart3, Users, Target, BookOpen, Mail, MapPin, Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden scroll-smooth">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-black/5 dark:bg-white/5 blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-black/5 dark:bg-white/5 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[20%] h-[400px] w-[400px] rounded-full bg-black/5 dark:bg-white/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-500 dark:from-white dark:to-zinc-500">
            Manage Student Projects <br />Like a Pro.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            The ultimate platform for universities to track, grade, and organize student projects.
            Streamlined workflow for professors, automated insights for admins.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 border border-transparent dark:border-white/10">
              Start Managing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>

        {/* Features Grid */}
        <section className="mt-32 grid gap-8 md:grid-cols-3 relative z-10">
          {[
            {
              icon: ShieldCheck,
              title: "Secure & Reliable",
              desc: "Enterprise-grade encryption ensures your student data and grades remain confidential and safe.",
              color: "text-black dark:text-white"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Built on Next.js for instant page loads and real-time updates. No more waiting.",
              color: "text-zinc-800 dark:text-zinc-300"
            },
            {
              icon: BarChart3,
              title: "Smart Analytics",
              desc: "Get detailed insights into project completion rates, class performance, and more.",
              color: "text-zinc-600 dark:text-zinc-400"
            }
          ].map((feature, i) => (
            <Card key={i} className="group overflow-hidden border-border bg-white/60 dark:bg-black/60 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black/20 dark:hover:border-white/20">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border transition-transform group-hover:scale-110">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl tracking-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* About Us Section */}
        <section id="about" className="mt-32 relative z-10 scroll-mt-24">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-500 dark:from-white dark:to-zinc-500">
              About Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              SPMS is designed to simplify the management of student projects in universities and colleges.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To provide a seamless, modern platform that bridges the gap between students, faculty, and administration in managing academic projects efficiently."
              },
              {
                icon: Users,
                title: "Who We Serve",
                desc: "Students tracking their project milestones, faculty managing evaluations and meetings, and admins overseeing the entire academic project lifecycle."
              },
              {
                icon: BookOpen,
                title: "What We Offer",
                desc: "Project group management, proposal tracking, meeting scheduling, attendance monitoring, document uploads, evaluations, and comprehensive reporting — all in one place."
              }
            ].map((item, i) => (
              <Card key={i} className="group overflow-hidden border-border bg-white/60 dark:bg-black/60 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border transition-transform group-hover:scale-110">
                    <item.icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <CardTitle className="text-xl tracking-tight">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {item.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="mt-32 relative z-10 scroll-mt-24">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-500 dark:from-white dark:to-zinc-500">
              Contact Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or need support? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <Card className="group overflow-hidden border-border bg-white/60 dark:bg-black/60 shadow-md backdrop-blur-xl text-center transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="pt-8 pb-6 flex flex-col items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border transition-transform group-hover:scale-110">
                  <Mail className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="font-semibold text-lg mt-2">Email</h3>
                <p className="text-muted-foreground text-sm">support@spms.edu</p>
                <p className="text-muted-foreground text-sm">admin@spms.edu</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-border bg-white/60 dark:bg-black/60 shadow-md backdrop-blur-xl text-center transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="pt-8 pb-6 flex flex-col items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border transition-transform group-hover:scale-110">
                  <Phone className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="font-semibold text-lg mt-2">Phone</h3>
                <p className="text-muted-foreground text-sm">+91 98765 43210</p>
                <p className="text-muted-foreground text-sm">Mon–Fri, 9AM–5PM</p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-border bg-white/60 dark:bg-black/60 shadow-md backdrop-blur-xl text-center transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="pt-8 pb-6 flex flex-col items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-border transition-transform group-hover:scale-110">
                  <MapPin className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                </div>
                <h3 className="font-semibold text-lg mt-2">Address</h3>
                <p className="text-muted-foreground text-sm">Computer Science Dept.</p>
                <p className="text-muted-foreground text-sm">University Campus, India</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white/50 dark:bg-black/50 backdrop-blur-lg relative z-10 mt-16">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row md:py-6 px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SPMS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
