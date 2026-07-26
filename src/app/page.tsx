import Link from "next/link";
import { auth } from "@/auth/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Sparkles, BookOpen, Brain, BarChart3, Zap, Shield, Clock,
  Upload, CheckCircle2, Play, Star, ChevronDown,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative px-4 pt-24 pb-20 md:pt-32 md:pb-28 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(45%_35%_at_50%_55%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Learning Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
            Turn Any Syllabus Into a{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Personalized Learning Journey
            </span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Upload your syllabus, get AI-powered study plans, interactive quizzes, and track your progress
            — all tailored to your curriculum. Learn faster, remember more.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 h-12 px-8 text-base">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/25">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base">
                    <Play className="h-4 w-4" /> How It Works
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Upload any PDF
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              AI-powered analytics
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="border-y bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Active Students" },
              { value: "50K+", label: "Study Plans Created" },
              { value: "95%", label: "Satisfaction Rate" },
              { value: "500+", label: "Universities" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-bold tracking-tight text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              Simple Process
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How Vidya Works</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From syllabus to mastery in four simple steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border" />
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload PDF",
                desc: "Upload any PDF syllabus or paste the text directly. We support all formats.",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analysis",
                desc: "Our AI extracts topics, priorities, and difficulty levels from your syllabus.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Get Your Plan",
                desc: "Receive a personalized study schedule with daily tasks tailored to you.",
              },
              {
                step: "04",
                icon: Sparkles,
                title: "Learn & Track",
                desc: "Complete tasks, take quizzes, and monitor your progress over time.",
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 bg-background shadow-sm">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-semibold text-primary mb-2 tracking-wider">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              Everything You Need
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Powerful Features</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Tools designed to make learning efficient and enjoyable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Smart Study Plans",
                desc: "AI generates a day-by-day study schedule based on your syllabus, deadlines, and available time. Adapts as you go.",
                icon: Brain,
                gradient: "from-violet-500/10 to-transparent",
              },
              {
                title: "Interactive Quizzes",
                desc: "Auto-generated quizzes with instant feedback. Identify weak areas and reinforce your knowledge with adaptive questions.",
                icon: Zap,
                gradient: "from-amber-500/10 to-transparent",
              },
              {
                title: "Progress Tracking",
                desc: "Visual dashboards showing completion rates, streaks, time spent, and mastery levels across all your subjects.",
                icon: BarChart3,
                gradient: "from-emerald-500/10 to-transparent",
              },
              {
                title: "Daily Agenda",
                desc: "Each day you get a curated plan of what to study. Check off completed tasks and never fall behind.",
                icon: Clock,
                gradient: "from-blue-500/10 to-transparent",
              },
              {
                title: "Multiple Syllabuses",
                desc: "Manage multiple courses simultaneously. Switch between study plans and track everything in one place.",
                icon: BookOpen,
                gradient: "from-rose-500/10 to-transparent",
              },
              {
                title: "Secure & Private",
                desc: "Your data is encrypted. Sign in securely and access your study materials from any device, anywhere.",
                icon: Shield,
                gradient: "from-cyan-500/10 to-transparent",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
              >
                <div className={cn(`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform`)}>
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Preview */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                See It In Action
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A Complete Learning Dashboard
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                From your daily agenda to detailed analytics, everything you need to stay on top of your studies.
                Track your streaks, monitor quiz performance, and see your progress at a glance.
              </p>
              <ul className="space-y-3">
                {[
                  "Day-by-day study schedule with task tracking",
                  "AI-generated quizzes with detailed feedback",
                  "Progress analytics with streaks and mastery scores",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2">
                      Go to Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/register">
                    <Button size="lg" className="gap-2">
                      Try It Free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border bg-card p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                    <div className="h-8 w-8 rounded-full bg-primary/10" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Data Structures & Algorithms</p>
                    <p className="text-xs text-muted-foreground">Week 3 of 12</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-success">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    68%
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Arrays & Hashing", progress: 80 },
                    { label: "Two Pointers", progress: 45 },
                    { label: "Sliding Window", progress: 0 },
                    { label: "Binary Search", progress: 0 },
                  ].map((topic) => (
                    <div key={topic.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{topic.label}</span>
                        <span className="text-muted-foreground">{topic.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl border bg-muted/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/30 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <Star className="h-4 w-4 text-amber-500" />
              Loved by Students
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Students Say</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join thousands of students who transformed their study habits.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Vidya completely changed how I prepare for exams. The AI study plans saved me hours of planning every week.",
                name: "Sarah Chen",
                role: "Computer Science, MIT",
                rating: 5,
              },
              {
                quote: "The quizzes are incredibly effective. I was able to identify my weak areas and improve my grades significantly.",
                name: "James Rodriguez",
                role: "Engineering, Stanford",
                rating: 5,
              },
              {
                quote: "I love how I can manage all my courses in one place. The progress tracking keeps me motivated every day.",
                name: "Priya Patel",
                role: "Medicine, Johns Hopkins",
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 md:py-28" id="faq">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to know about Vidya.
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "How does Vidya create study plans?",
                a: "Vidya uses AI to analyze your syllabus PDF, extract all topics, determine their difficulty and priority, and generate a day-by-day study schedule based on your available time and deadline.",
              },
              {
                q: "What file formats are supported?",
                a: "Currently we support PDF uploads. You can also paste syllabus text directly into the platform. More formats coming soon.",
              },
              {
                q: "Is my data secure?",
                a: "Yes. Your data is encrypted in transit and at rest. We use industry-standard security practices and never share your information with third parties.",
              },
              {
                q: "Can I use Vidya for multiple courses?",
                a: "Absolutely! You can create and manage multiple syllabuses, each with its own study plan, quizzes, and progress tracking.",
              },
              {
                q: "Is there a mobile app?",
                a: "Not yet, but Vidya is fully responsive and works great on mobile browsers. A native app is on our roadmap.",
              },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border bg-card p-5 [&[open]]:shadow-sm transition-shadow">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-sm">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t px-4 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_50%,hsl(var(--primary)/0.08),transparent)]" />
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            Start Learning Today
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to Learn Smarter?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
            Join thousands of students who are already transforming their study habits with AI-powered learning.
          </p>
          <div className="mt-10">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/25">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}
