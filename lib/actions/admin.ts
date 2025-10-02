"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

export async function updateApplicationStatus(
  applicationId: string,
  status: "APPROVED" | "REJECTED"
) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const currentApp = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });

    await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: session.user.id!,
      applicationId,
      action: "STATUS_CHANGED",
      fieldName: "status",
      oldValue: currentApp?.status || "UNKNOWN",
      newValue: status,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    throw new Error("Failed to update application status");
  }
}

export async function updateApplicationStatusWithNote(
  applicationId: string,
  status: "APPROVED" | "REJECTED",
  reviewNote?: string
) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const currentApp = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { status: true, reviewNote: true },
    });

    await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
        reviewNote: reviewNote || null,
        updatedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: session.user.id!,
      applicationId,
      action: "STATUS_CHANGED",
      fieldName: "status",
      oldValue: currentApp?.status || "UNKNOWN",
      newValue: status,
    });

    if (reviewNote && reviewNote !== currentApp?.reviewNote) {
      await createAuditLog({
        userId: session.user.id!,
        applicationId,
        action: "REVIEW_NOTE_ADDED",
        fieldName: "reviewNote",
        oldValue: currentApp?.reviewNote || "None",
        newValue: reviewNote,
      });
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    throw new Error("Failed to update application status");
  }
}