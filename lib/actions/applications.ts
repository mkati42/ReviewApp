"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateRiskScore, calculateTechnicalComplexity } from "@/lib/risk-calculator";
import { createAuditLog } from "@/lib/audit";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createApplication(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to create an application",
      };
    }

    const title = formData.get("title") as string;
    const projectType = formData.get("projectType") as string;
    const description = formData.get("description") as string;
    const technicalDesc = formData.get("technicalDesc") as string;
    const duration = parseInt(formData.get("duration") as string);
    const cost = parseFloat(formData.get("cost") as string);
    const documentLink = formData.get("documentLink") as string;

    if (!title || title.trim().length === 0) {
      return { success: false, error: "Project title is required" };
    }

    if (!projectType) {
      return { success: false, error: "Project type is required" };
    }

    const validProjectTypes = [
      "WEB_DEVELOPMENT",
      "MOBILE_APP",
      "DATA_ANALYSIS",
      "INFRASTRUCTURE",
      "SECURITY",
      "RESEARCH",
      "OTHER"
    ];
    
    if (!validProjectTypes.includes(projectType)) {
      return { success: false, error: "Invalid project type" };
    }

    if (!description || description.trim().length < 20) {
      return { success: false, error: "Description must be at least 20 characters" };
    }

    if (!technicalDesc || technicalDesc.trim().length < 50) {
      return { success: false, error: "Technical description must be at least 50 characters" };
    }

    if (!duration || duration < 1) {
      return { success: false, error: "Duration must be at least 1 day" };
    }

    if (!cost || cost < 0) {
      return { success: false, error: "Cost must be a positive number" };
    }

    const technicalComplexity = calculateTechnicalComplexity(technicalDesc);
    const riskScore = calculateRiskScore({
      cost,
      duration,
      projectType,
      technicalComplexity,
    });

    const application = await prisma.application.create({
      data: {
        title: title.trim(),
        projectType,
        description: description.trim(),
        technicalDesc: technicalDesc.trim(),
        duration,
        cost,
        documentLink: documentLink?.trim() || null,
        riskScore,
        userId: session.user.id,
      } as any,
    });

    await createAuditLog({
      userId: session.user.id,
      applicationId: application.id,
      action: "CREATED",
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
  } catch (error) {
    console.error("Error creating application:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return {
      success: false,
      error: `Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }

  redirect("/dashboard");
}