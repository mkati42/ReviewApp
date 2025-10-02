import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRiskLevel } from "@/lib/risk-calculator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemId = params.id;

    const item = await prisma.application.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        auditLogs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (item.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized - You can only view your own items" },
        { status: 403 }
      );
    }

    const riskLevel = getRiskLevel(item.riskScore);

    return NextResponse.json({
      item: {
        ...item,
        riskLevel
      }
    });

  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemId = params.id;
    const body = await request.json();

    const existingItem = await prisma.application.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (existingItem.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized - You can only update your own items" },
        { status: 403 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN';
    const allowedFields = isAdmin 
      ? ['title', 'description', 'technicalDesc', 'projectType', 'duration', 'cost', 'documentLink', 'status', 'reviewNote']
      : ['title', 'description', 'technicalDesc', 'projectType', 'duration', 'cost', 'documentLink'];

    const updateData: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.application.update({
      where: { id: itemId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    for (const [field, newValue] of Object.entries(updateData)) {
      if (existingItem[field as keyof typeof existingItem] !== newValue) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            applicationId: itemId,
            action: field === 'status' ? 'STATUS_CHANGED' : 'UPDATED',
            fieldName: field,
            oldValue: String(existingItem[field as keyof typeof existingItem] || ''),
            newValue: String(newValue || '')
          }
        });
      }
    }

    return NextResponse.json({
      item: updatedItem,
      message: "Item updated successfully"
    });

  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemId = params.id;

    const existingItem = await prisma.application.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (existingItem.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized - You can only delete your own items" },
        { status: 403 }
      );
    }

    await prisma.application.delete({
      where: { id: itemId }
    });

    return NextResponse.json({
      message: "Item deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}