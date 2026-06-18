import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/session";
import type { PropertyFilters, PropertyFormData, PaginatedResponse, PropertyWithDetails } from "@/types";
import { FULL_USER_SELECT, parsePropertiesImages, parsePropertyImages, stringifyImages } from "@/lib/api-helpers";

const PROPERTY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RENTED: "RENTED",
} as const;

const LISTING_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SOLD: "SOLD",
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUser = await getCurrentUser();

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
      rentPeriod: searchParams.get("rentPeriod") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    };

    const where: any = {};

    if (currentUser?.role === "LANDLORD") {
      where.landlordId = currentUser.id;
    } else if (currentUser?.role !== "ADMIN") {
      where.status = PROPERTY_STATUS.APPROVED;
      where.listingStatus = LISTING_STATUS.ACTIVE;
    }

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
        { address: { contains: filters.query, mode: "insensitive" } },
      ];
    }

    if (filters.city) where.city = filters.city;
    if (filters.district) where.district = filters.district;
    if (filters.propertyType) where.type = filters.propertyType;
    if (filters.minPrice !== undefined) where.price = { ...where.price, gte: filters.minPrice };
    if (filters.maxPrice !== undefined) where.price = { ...where.price, lte: filters.maxPrice };
    if (filters.minArea !== undefined) where.area = { ...where.area, gte: filters.minArea };
    if (filters.maxArea !== undefined) where.area = { ...where.area, lte: filters.maxArea };
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
    if (filters.rentPeriod) where.rentPeriod = filters.rentPeriod;

    const orderBy: any = {};
    if (filters.sortBy === "price") {
      orderBy.price = filters.sortOrder;
    } else if (filters.sortBy === "area") {
      orderBy.area = filters.sortOrder;
    } else {
      orderBy.createdAt = filters.sortOrder;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          landlord: {
            select: FULL_USER_SELECT,
          },
          reviews: {
            include: {
              tenant: {
                select: FULL_USER_SELECT,
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

    const processedProperties = properties.map((p) => {
      const parsed = parsePropertyImages(p);
      return {
        ...parsed,
        reviews: p.reviews.map((r) => ({
          ...r,
          tenant: r.tenant,
        })),
      };
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: processedProperties,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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

export async function POST(request: Request) {
  try {
    const user = await requireRole(["LANDLORD", "ADMIN"]);
    const body = (await request.json()) as PropertyFormData;

    const {
      title,
      description,
      price,
      rentPeriod,
      deposit,
      area,
      bedrooms,
      bathrooms,
      floor,
      totalFloors,
      orientation,
      type,
      furnished,
      hasParking,
      hasElevator,
      hasBalcony,
      hasGarden,
      hasPool,
      hasGym,
      petsAllowed,
      smokingAllowed,
      address,
      city,
      district,
      province,
      zipCode,
      latitude,
      longitude,
      images,
      videoUrl,
      virtualTourUrl,
      availableFrom,
      minimumStay,
      maximumStay,
    } = body;

    if (!title || !description || !price || !area || !bedrooms || !bathrooms || !type || !address || !city || !district || !province || !images || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "请填写所有必填字段",
        },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "价格必须大于0",
        },
        { status: 400 }
      );
    }

    if (area <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "面积必须大于0",
        },
        { status: 400 }
      );
    }

    const property = await db.property.create({
      data: {
        title,
        description,
        price,
        rentPeriod,
        deposit,
        area,
        bedrooms,
        bathrooms,
        floor,
        totalFloors,
        orientation,
        type,
        furnished,
        hasParking,
        hasElevator,
        hasBalcony,
        hasGarden,
        hasPool,
        hasGym,
        petsAllowed,
        smokingAllowed,
        address,
        city,
        district,
        province,
        zipCode,
        latitude,
        longitude,
        images: stringifyImages(images),
        videoUrl,
        virtualTourUrl,
        availableFrom,
        minimumStay,
        maximumStay,
        landlordId: user.id,
        status: user.role === "ADMIN" ? PROPERTY_STATUS.APPROVED : PROPERTY_STATUS.PENDING,
      },
      include: {
        landlord: {
          select: FULL_USER_SELECT,
        },
        reviews: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    const processedProperty = parsePropertyImages(property);

    return NextResponse.json({
      success: true,
      data: processedProperty,
      message: user.role === "ADMIN" ? "房源创建成功" : "房源发布成功，等待管理员审核",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    console.error("Error creating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建房源失败",
      },
      { status: 500 }
    );
  }
}
