import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/session";
import { PropertyStatus, ListingStatus } from "@prisma/client";
import type { PropertyFormData, PropertyWithDetails } from "@/types";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const currentUser = await getCurrentUser();

    const where: any = { id };

    if (currentUser?.role !== "ADMIN") {
      const property = await db.property.findUnique({
        where: { id },
        select: { landlordId: true, status: true, listingStatus: true },
      });

      if (!property) {
        return NextResponse.json(
          {
            success: false,
            error: "房源不存在",
          },
          { status: 404 }
        );
      }

      if (currentUser?.role === "LANDLORD" && property.landlordId !== currentUser.id) {
        where.status = PropertyStatus.APPROVED;
        where.listingStatus = ListingStatus.ACTIVE;
      } else if (!currentUser || currentUser.role === "TENANT") {
        where.status = PropertyStatus.APPROVED;
        where.listingStatus = ListingStatus.ACTIVE;
      }
    }

    const property = await db.property.findUnique({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            bio: true,
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
        bookings: {
          where: currentUser?.role === "LANDLORD" || currentUser?.role === "ADMIN" ? {} : { tenantId: currentUser?.id },
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
    });

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: "房源不存在",
        },
        { status: 404 }
      );
    }

    let isFavorite = false;
    if (currentUser) {
      const favorite = await db.favorite.findFirst({
        where: {
          userId: currentUser.id,
          propertyId: id,
        },
      });
      isFavorite = !!favorite;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...property,
        isFavorite,
      } as PropertyWithDetails & { isFavorite: boolean },
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "获取房源详情失败",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = (await request.json()) as Partial<PropertyFormData>;

    const existingProperty = await db.property.findUnique({
      where: { id },
      select: { landlordId: true, status: true },
    });

    if (!existingProperty) {
      return NextResponse.json(
        {
          success: false,
          error: "房源不存在",
        },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && existingProperty.landlordId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无权限修改此房源",
        },
        { status: 403 }
      );
    }

    if (body.price !== undefined && body.price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "价格必须大于0",
        },
        { status: 400 }
      );
    }

    if (body.area !== undefined && body.area <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "面积必须大于0",
        },
        { status: 400 }
      );
    }

    const updateData: any = { ...body };

    if (user.role !== "ADMIN" && existingProperty.status !== "PENDING") {
      updateData.status = PropertyStatus.PENDING;
    }

    const property = await db.property.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: property,
      message: user.role === "ADMIN" ? "房源更新成功" : "房源更新成功，等待重新审核",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "更新房源失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { id } = params;

    const existingProperty = await db.property.findUnique({
      where: { id },
      select: { landlordId: true },
    });

    if (!existingProperty) {
      return NextResponse.json(
        {
          success: false,
          error: "房源不存在",
        },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && existingProperty.landlordId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "无权限删除此房源",
        },
        { status: 403 }
      );
    }

    await db.property.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "房源删除成功",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "删除房源失败",
      },
      { status: 500 }
    );
  }
}
