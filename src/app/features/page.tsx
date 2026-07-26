import { auth } from "@/auth/config";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, BarChart3, BookOpen, Zap, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Study Plans",
    desc: "Upload any syllabus and get a day-by-day personalized study schedule. Our AI breaks down your curriculum into manageable daily tasks based on difficulty, deadlines, and your available time.",
    gradient: "from-violet-500/10 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Smart Quizzes",
    desc: "Auto-generated quizzes for each topic with instant feedback. Each quiz adapts to your knowledge level, reinforcing weak areas and challenging your strengths.",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    desc: "Track your learning journey with detailed metrics — completion rates, topic mastery, study streaks, and time spent. See exactly where you excel and what needs more focus.",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    icon: BookOpen,
    title: "Syllabus Management",
    desc: "Manage multiple syllabuses across subjects. Upload PDFs or paste text, organize by semester or course, and switch between study plans effortlessly.",
    gradient: "from-blue-500/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Daily Plans",
    desc: "Each day you get a curated plan of what to study. Check off completed tasks, adjust your schedule, and never fall behind with automatic rebalancing.",
    gradient: "from-rose-500/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data is encrypted and never shared. Sign in securely with your preferred provider and access your study materials from any device.",
    gradient: "from-cyan-500/10 to-transparent",
  },
];

export default async function FeaturesPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-24 pb-8">
        <div className="mx-auto max-w-6xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Powerful Features
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Master Your Curriculum
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            AI-powered tools designed to make learning efficient, personalized, and enjoyable.
          </p>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
              >
                <div className={cn(`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.gradient} group-hover:scale-110 transition-transform`)}>
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold mb-2">{f.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-20 text-center bg-muted/30">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to Transform Your Learning?
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Cancel anytime
            </div>
          </div>
          <div>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}