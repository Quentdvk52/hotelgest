export interface AuditLogPayload {
  tenantId: string;
  propertyId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  propertyId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string; // Serialized JSON
  ipAddress?: string;
  createdAt: Date;
}

// In-memory buffer for real-time audit tracing & tests
const auditLogBuffer: AuditLogEntry[] = [];

/**
 * Creates and formats an audit log entry while scrubbing any sensitive tokens/passwords.
 */
export function createAuditLogEntry(payload: AuditLogPayload): AuditLogEntry {
  const sanitizedDetails = { ...payload.details };
  // Never log sensitive data
  delete (sanitizedDetails as Record<string, unknown>).password;
  delete (sanitizedDetails as Record<string, unknown>).token;
  delete (sanitizedDetails as Record<string, unknown>).creditCard;
  delete (sanitizedDetails as Record<string, unknown>).secret;

  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    tenantId: payload.tenantId,
    propertyId: payload.propertyId,
    userId: payload.userId,
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    details: JSON.stringify(sanitizedDetails),
    ipAddress: payload.ipAddress,
    createdAt: new Date(),
  };

  auditLogBuffer.push(entry);
  return entry;
}

export function getRecentAuditLogs(tenantId: string, limit = 50): AuditLogEntry[] {
  return auditLogBuffer
    .filter((log) => log.tenantId === tenantId)
    .slice(-limit)
    .reverse();
}
