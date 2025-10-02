import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRiskScore, calculateTechnicalComplexity } from "@/lib/risk-calculator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const projectType = searchParams.get('projectType');
    const search = searchParams.get('search');

    const where: any = {};

    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (minScore || maxScore) {
      where.riskScore = {};
      if (minScore) where.riskScore.gte = parseInt(minScore);
      if (maxScore) where.riskScore.lte = parseInt(maxScore);
    }

    if (projectType) {
      where.projectType = projectType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { technicalDesc: { contains: search, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            auditLogs: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      items,
      total: items.length,
      filters: {
        status,
        minScore,
        maxScore,
        projectType,
        search
      }
    });

  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      technicalDesc,
      projectType,
      duration,
      cost,
      documentLink,
      tags 
    } = body;

    if (!title || !description || !technicalDesc || !projectType) {
      return NextResponse.json(
        { error: "Title, description, technical description and project type are required" },
        { status: 400 }
      );
    }

    if (!duration || duration < 1) {
      return NextResponse.json(
        { error: "Duration must be at least 1 day" },
        { status: 400 }
      );
    }

    if (!cost || cost < 0) {
      return NextResponse.json(
        { error: "Cost must be a positive number" },
        { status: 400 }
      );
    }

    const technicalComplexity = calculateTechnicalComplexity(technicalDesc);
    const itemData = {
      projectType,
      duration,
      cost,
      technicalComplexity
    };
    const riskScore = calculateRiskScore(itemData);

    const newItem = await prisma.application.create({
      data: {
        userId: session.user.id,
        title,
        description,
        technicalDesc,
        projectType,
        duration,
        cost,
        documentLink: documentLink || null,
        riskScore,
        status: 'PENDING'
      },
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

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        applicationId: newItem.id,
        action: 'CREATED',
        fieldName: 'status',
        newValue: 'PENDING'
      }
    });

    return NextResponse.json({
      item: newItem,
      message: "Item created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Item IDs are required" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Updates are required" },
        { status: 400 }
      );
    }

    const updatedItems = await prisma.application.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: updates
    });

    for (const id of ids) {
      for (const [field, value] of Object.entries(updates)) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            applicationId: id,
            action: 'UPDATED',
            fieldName: field,
            newValue: String(value)
          }
        });
      }
    }

    return NextResponse.json({
      message: `${updatedItems.count} items updated successfully`,
      updated: updatedItems.count
    });

  } catch (error) {
    console.error("Error updating items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}