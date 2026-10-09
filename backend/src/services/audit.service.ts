import type { Prisma } from '@prisma/client';

type AuditInput = {
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  recommendationId?: string;
  details?: Prisma.InputJsonValue;
};

export async function writeAuditLog(tx: Prisma.TransactionClient, input: AuditInput): Promise<void> {
  await tx.auditLog.create({
    data: {
      ...input,
      recommendationId: input.recommendationId ?? null,
      details: input.details,
    },
  });
}
