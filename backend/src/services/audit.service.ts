import prisma from '../utils/prisma';

export async function createAuditLog(params: {
  adminId: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue ?? undefined,
      newValue: params.newValue ?? undefined,
      ipAddress: params.ipAddress,
    },
  });
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  adminId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { page = 1, limit = 20, adminId, action, entityType, startDate, endDate } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (adminId) where.adminId = adminId;
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { admin: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
