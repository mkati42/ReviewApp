import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRiskScore, calculateTechnicalComplexity, getRiskLevel } from "@/lib/risk-calculator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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
      where: { id: itemId },
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

    const technicalComplexity = calculateTechnicalComplexity(existingItem.technicalDesc);

    const riskData = {
      projectType: existingItem.projectType,
      duration: existingItem.duration,
      cost: existingItem.cost,
      technicalComplexity
    };

    const newRiskScore = calculateRiskScore(riskData);
    const riskLevel = getRiskLevel(newRiskScore);

    const oldRiskScore = existingItem.riskScore;

    const updatedItem = await prisma.application.update({
      where: { id: itemId },
      data: {
        riskScore: newRiskScore
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
        applicationId: itemId,
        action: 'UPDATED',
        fieldName: 'riskScore',
        oldValue: String(oldRiskScore),
        newValue: String(newRiskScore)
      }
    });

    return NextResponse.json({
      item: updatedItem,
      riskAnalysis: {
        oldScore: oldRiskScore,
        newScore: newRiskScore,
        level: riskLevel,
        factors: {
          cost: existingItem.cost,
          duration: existingItem.duration,
          projectType: existingItem.projectType,
          technicalComplexity
        }
      },
      message: "Risk score updated successfully"
    });

  } catch (error) {
    console.error("Error calculating risk score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
            email: true
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
    const technicalComplexity = calculateTechnicalComplexity(item.technicalDesc);

    return NextResponse.json({
      item,
      riskAnalysis: {
        currentScore: item.riskScore,
        level: riskLevel,
        factors: {
          cost: item.cost,
          duration: item.duration,
          projectType: item.projectType,
          technicalComplexity
        }
      }
    });

  } catch (error) {
    console.error("Error fetching risk score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}