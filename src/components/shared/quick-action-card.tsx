import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "primary";
  className?: string;
}

export function QuickActionCard({ title, description, icon, href, variant = "default", className }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        variant === "primary" && "border-primary/20 bg-primary/5 hover:bg-primary/10",
        className,
      )}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        variant === "primary" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
      )}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Link>
  );
}