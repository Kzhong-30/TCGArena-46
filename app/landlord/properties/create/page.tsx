import { requireRole } from "@/lib/session";
import PropertyWizard from "@/components/PropertyWizard";

export const dynamic = "force-dynamic";

export default async function CreatePropertyPage() {
  await requireRole(["LANDLORD", "ADMIN"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">发布房源</h1>
        <p className="text-gray-500 mt-1">填写以下信息发布您的房源</p>
      </div>
      <PropertyWizard mode="create" />
    </div>
  );
}
