import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({ title, description, className, align = "left" }: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", align === "center" && "text-center", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}