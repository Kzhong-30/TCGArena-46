import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import PropertyClient from "./PropertyClient";
import type { PropertyWithDetails, ReviewWithDetails } from "@/types";

interface PropertyPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      images: true,
      city: true,
      district: true,
      price: true,
    },
  });

  if (!property) {
    return {
      title: "房源不存在 | 城市租房平台",
    };
  }

  const images = Array.isArray(property.images) ? property.images : [];

  return {
    title: `${property.title} | 城市租房平台`,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: images.length > 0 ? [images[0]] : [],
      locale: "zh_CN",
      type: "website",
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const session = await getServerSession(authOptions);

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      landlord: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          bio: true,
          createdAt: true,
          role: true,
        },
      },
      reviews: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          bookings: true,
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  if (!property || property.status !== "APPROVED") {
    notFound();
  }

  const isFavorited = session
    ? !!(await prisma.favorite.findFirst({
        where: {
          userId: session.user.id,
          propertyId: params.id,
        },
      }))
    : false;

  const landlordPropertyCount = await prisma.property.count({
    where: {
      landlordId: property.landlordId,
      status: "APPROVED",
      listingStatus: "ACTIVE",
    },
  });

  const averageRating =
    property.reviews.length > 0
      ? property.reviews.reduce((acc, r) => acc + r.rating, 0) /
        property.reviews.length
      : 0;

  const propertyWithDetails: PropertyWithDetails = {
    ...property,
    reviews: property.reviews as any,
  };

  const reviewsWithDetails: ReviewWithDetails[] = property.reviews as any;

  return (
    <PropertyClient
      property={propertyWithDetails}
      reviews={reviewsWithDetails}
      landlordPropertyCount={landlordPropertyCount}
      averageRating={averageRating}
      isFavorited={isFavorited}
      currentUserId={session?.user.id}
    />
  );
}
