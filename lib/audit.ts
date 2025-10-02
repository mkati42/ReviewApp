import { prisma } from "@/lib/prisma";

type AuditAction = "CREATED" | "STATUS_CHANGED" | "REVIEW_NOTE_ADDED" | "UPDATED";

interface CreateAuditLogParams {
  userId: string;
  applicationId: string;
  action: AuditAction;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}

export async function createAuditLog({
  userId,
  applicationId,
  action,
  fieldName,
  oldValue,
  newValue,
}: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        applicationId,
        action,
        fieldName,
        oldValue,
        newValue,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}