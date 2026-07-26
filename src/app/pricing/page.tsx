import { auth } from "@/auth/config";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Get started with basic learning tools.",
    features: [
      "1 syllabus",
      "AI study plans",
      "Basic quizzes",
      "Progress tracking",
    ],
    cta: "Get Started Free",
    href: "/auth/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    desc: "Unlock the full learning experience.",
    features: [
      "Unlimited syllabuses",
      "Advanced AI plans",
      "Unlimited quizzes",
      "Detailed analytics",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/auth/register",
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    desc: "For groups and classrooms.",
    features: [
      "Everything in Pro",
      "Up to 10 members",
      "Shared syllabuses",
      "Team progress",
      "Admin dashboard",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
];

export default async function PricingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-24 pb-8">
        <div className="mx-auto max-w-6xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Simple Pricing
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Plans for{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Every Learner
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more power.
          </p>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border bg-card p-6 shadow-sm flex flex-col",
                plan.featured && "ring-2 ring-primary shadow-lg shadow-primary/10 relative scale-[1.02]",
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={isLoggedIn && plan.href === "/auth/register" ? "/dashboard" : plan.href}
                className="mt-8 block"
              >
                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className={cn("w-full gap-2", plan.featured && "shadow-lg shadow-primary/25")}
                >
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}