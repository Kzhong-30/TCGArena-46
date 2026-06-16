import { requireRole } from "@/lib/session";
import db from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import PropertyWizard from "@/components/PropertyWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { parseImages } from "@/lib/utils";
import type { PropertyFormData } from "@/types";

export const dynamic = "force-dynamic";

interface EditPropertyPageProps {
  params: { id: string };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const user = await requireRole(["LANDLORD", "ADMIN"]);

  const property = await db.property.findUnique({
    where: { id: params.id },
  });

  if (!property) {
    notFound();
  }

  if (property.landlordId !== user.id && user.role !== "ADMIN") {
    redirect("/landlord/properties");
  }

  const initialData: Partial<PropertyFormData> = {
    title: property.title,
    description: property.description,
    type: property.type as any,
    area: property.area,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    floor: property.floor || undefined,
    totalFloors: property.totalFloors || undefined,
    orientation: property.orientation || "",
    furnished: property.furnished,
    hasParking: property.hasParking,
    hasElevator: property.hasElevator,
    hasBalcony: property.hasBalcony,
    hasGarden: property.hasGarden,
    hasPool: property.hasPool,
    hasGym: property.hasGym,
    petsAllowed: property.petsAllowed,
    smokingAllowed: property.smokingAllowed,
    address: property.address,
    city: property.city,
    district: property.district,
    province: property.province,
    zipCode: property.zipCode || "",
    latitude: property.latitude ? Number(property.latitude) : undefined,
    longitude: property.longitude ? Number(property.longitude) : undefined,
    price: Number(property.price),
    rentPeriod: property.rentPeriod as any,
    deposit: property.deposit ? Number(property.deposit) : undefined,
    images: parseImages(property.images as string | null),
    videoUrl: property.videoUrl || "",
    virtualTourUrl: property.virtualTourUrl || "",
    availableFrom: property.availableFrom
      ? property.availableFrom.toISOString().split("T")[0]
      : undefined,
    minimumStay: property.minimumStay || undefined,
    maximumStay: property.maximumStay || undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/landlord/properties"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">编辑房源</h1>
          <p className="text-gray-500 mt-1">修改房源信息</p>
        </div>
      </div>
      <PropertyWizard
        mode="edit"
        propertyId={params.id}
        initialData={initialData}
      />
    </div>
  );
}
