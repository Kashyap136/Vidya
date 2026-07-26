import { redirect } from "next/navigation";
import { auth } from "@/auth/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
