import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import TenantNav from "@/components/TenantNav";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TenantNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
