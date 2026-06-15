import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { PropertyStatus, ListingStatus, Prisma } from "@prisma/client";
import type { PropertyFilters, PropertyWithDetails } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: PropertyFilters = {
      query: searchParams.get("query") || undefined,
      city: searchParams.get("city") || undefined,
      district: searchParams.get("district") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      minArea: searchParams.get("minArea") ? Number(searchParams.get("minArea")) : undefined,
      maxArea: searchParams.get("maxArea") ? Number(searchParams.get("maxArea")) : undefined,
      bedrooms: searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined,
      bathrooms: searchParams.get("bathrooms") ? Number(searchParams.get("bathrooms")) : undefined,
      orientation: searchParams.get("orientation") || undefined,
      furnished: searchParams.get("furnished") ? searchParams.get("furnished") === "true" : undefined,
      hasParking: searchParams.get("hasParking") ? searchParams.get("hasParking") === "true" : undefined,
      hasElevator: searchParams.get("hasElevator") ? searchParams.get("hasElevator") === "true" : undefined,
      hasBalcony: searchParams.get("hasBalcony") ? searchParams.get("hasBalcony") === "true" : undefined,
      hasGarden: searchParams.get("hasGarden") ? searchParams.get("hasGarden") === "true" : undefined,
      hasPool: searchParams.get("hasPool") ? searchParams.get("hasPool") === "true" : undefined,
      hasGym: searchParams.get("hasGym") ? searchParams.get("hasGym") === "true" : undefined,
      petsAllowed: searchParams.get("petsAllowed") ? searchParams.get("petsAllowed") === "true" : undefined,
      smokingAllowed: searchParams.get("smokingAllowed") ? searchParams.get("smokingAllowed") === "true" : undefined,
      amenities: searchParams.get("amenities") ? searchParams.get("amenities").split(",") : undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
    };

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.APPROVED,
      listingStatus: ListingStatus.ACTIVE,
    };

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
        { address: { contains: filters.query, mode: "insensitive" } },
        { city: { contains: filters.query, mode: "insensitive" } },
        { district: { contains: filters.query, mode: "insensitive" } },
      ];
    }

    if (filters.city) where.city = filters.city;
    if (filters.district) where.district = filters.district;
    if (filters.propertyType) where.type = filters.propertyType;
    if (filters.minPrice !== undefined) where.price = { ...where.price as object, gte: filters.minPrice };
    if (filters.maxPrice !== undefined) where.price = { ...where.price as object, lte: filters.maxPrice };
    if (filters.minArea !== undefined) where.area = { ...where.area as object, gte: filters.minArea };
    if (filters.maxArea !== undefined) where.area = { ...where.area as object, lte: filters.maxArea };
    if (filters.bedrooms !== undefined) where.bedrooms = filters.bedrooms;
    if (filters.bathrooms !== undefined) where.bathrooms = filters.bathrooms;
    if (filters.orientation) where.orientation = filters.orientation;
    if (filters.furnished !== undefined) where.furnished = filters.furnished;
    if (filters.hasParking !== undefined) where.hasParking = filters.hasParking;
    if (filters.hasElevator !== undefined) where.hasElevator = filters.hasElevator;
    if (filters.hasBalcony !== undefined) where.hasBalcony = filters.hasBalcony;
    if (filters.hasGarden !== undefined) where.hasGarden = filters.hasGarden;
    if (filters.hasPool !== undefined) where.hasPool = filters.hasPool;
    if (filters.hasGym !== undefined) where.hasGym = filters.hasGym;
    if (filters.petsAllowed !== undefined) where.petsAllowed = filters.petsAllowed;
    if (filters.smokingAllowed !== undefined) where.smokingAllowed = filters.smokingAllowed;

    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach((amenity) => {
        switch (amenity) {
          case "furnished":
            where.furnished = true;
            break;
          case "hasParking":
            where.hasParking = true;
            break;
          case "hasElevator":
            where.hasElevator = true;
            break;
          case "hasBalcony":
            where.hasBalcony = true;
            break;
          case "hasGarden":
            where.hasGarden = true;
            break;
          case "hasPool":
            where.hasPool = true;
            break;
          case "hasGym":
            where.hasGym = true;
            break;
          case "petsAllowed":
            where.petsAllowed = true;
            break;
          case "smokingAllowed":
            where.smokingAllowed = true;
            break;
        }
      });
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    if (filters.sortBy === "price") {
      orderBy.price = filters.sortOrder;
    } else if (filters.sortBy === "area") {
      orderBy.area = filters.sortOrder;
    } else if (filters.sortBy === "bedrooms") {
      orderBy.bedrooms = filters.sortOrder;
    } else if (filters.sortBy === "isFeatured") {
      orderBy.isFeatured = filters.sortOrder;
    } else {
      orderBy.createdAt = filters.sortOrder;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          landlord: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
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
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      db.property.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: properties as PropertyWithDetails[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取房源列表失败",
      },
      { status: 500 }
    );
  }
}
