import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LandlordNav from "@/components/LandlordNav";

export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "LANDLORD" && user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandlordNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
