import crypto from "crypto";
import { SEED_TENANT } from "../../lib/db/seed";
import { createAuditLogEntry } from "../../lib/audit/logger";

export type NotificationCategory =
  | "MESSAGES"
  | "ANNOUNCEMENTS"
  | "OPERATIONS"
  | "FINANCE"
  | "GOVERNANCE";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface NotificationRecord {
  id: string;
  tenantId: string;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  summary: string;
  actionUrl: string;
  read: boolean;
  readAt?: Date;
  entityType?: string;
  entityId?: string;
  deduplicationKey?: string;
  externalDeliveryStatus?: {
    email?: "SENT" | "UNCONFIGURED" | "CONSENT_MISSING";
    sms?: "SENT" | "UNCONFIGURED" | "CONSENT_MISSING";
    push?: "SENT" | "UNCONFIGURED" | "CONSENT_MISSING";
  };
  createdAt: Date;
}

export interface UserNotificationPreferences {
  userId: string;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string;   // "07:00"
}

export interface DispatchNotificationDto {
  tenantId?: string;
  userId: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  summary: string;
  actionUrl: string;
  entityType?: string;
  entityId?: string;
  deduplicationKey?: string;
}

class NotificationService {
  private notifications: NotificationRecord[] = [];
  private preferences: Map<string, UserNotificationPreferences> = new Map();
  private processedDeduplicationKeys = new Set<string>();

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.notifications = [];
    this.preferences.clear();
    this.processedDeduplicationKeys.clear();
    this.seedDefaultNotifications();
  }

  private seedDefaultNotifications() {
    // Seed standard initial notifications for promoter & staff
    this.dispatchNotification({
      tenantId: SEED_TENANT.id,
      userId: "user-prom-01",
      category: "ANNOUNCEMENTS",
      priority: "HIGH",
      title: "Nouvelle Note de Service Groupe",
      summary: "Directives relatives au gala de fin d'année et à la haute saison.",
      actionUrl: "/announcements?id=ann-01",
      deduplicationKey: "seed-notif-ann-01",
    });

    this.dispatchNotification({
      tenantId: SEED_TENANT.id,
      userId: "user-prom-01",
      category: "OPERATIONS",
      priority: "NORMAL",
      title: "Réservation Suite Royale Bohicon",
      summary: "Arrivée confirmée pour M. Mathieu Dossou (3 nuitées).",
      actionUrl: "/pms/reception",
      deduplicationKey: "seed-notif-pms-01",
    });

    this.dispatchNotification({
      tenantId: SEED_TENANT.id,
      userId: "user-prom-01",
      category: "FINANCE",
      priority: "NORMAL",
      title: "Clôture de Caisse Validée",
      summary: "Session caisse centrale équilibrée sans écart.",
      actionUrl: "/finance/cash",
      deduplicationKey: "seed-notif-cash-01",
    });
  }

  public getPreferences(userId: string): UserNotificationPreferences {
    const existing = this.preferences.get(userId);
    if (existing) return existing;

    const defaultPrefs: UserNotificationPreferences = {
      userId,
      inApp: true,
      email: true,
      sms: false, // Explicit consent needed for SMS
      push: true,
      categories: {
        MESSAGES: true,
        ANNOUNCEMENTS: true,
        OPERATIONS: true,
        FINANCE: true,
        GOVERNANCE: true,
      },
      quietHoursEnabled: false,
    };
    this.preferences.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  public updatePreferences(
    userId: string,
    updates: Partial<UserNotificationPreferences>
  ): UserNotificationPreferences {
    const current = this.getPreferences(userId);
    const updated: UserNotificationPreferences = {
      ...current,
      ...updates,
      categories: {
        ...current.categories,
        ...(updates.categories || {}),
      },
    };
    this.preferences.set(userId, updated);
    return updated;
  }

  public updateUserPreferences(
    userId: string,
    tenantId: string,
    updates: Partial<UserNotificationPreferences> & { emailNotifications?: boolean; smsNotifications?: boolean }
  ): UserNotificationPreferences {
    const current = this.getPreferences(userId);
    if (updates.emailNotifications !== undefined) current.email = updates.emailNotifications;
    if (updates.smsNotifications !== undefined) current.sms = updates.smsNotifications;
    Object.assign(current, updates);
    this.preferences.set(userId, current);
    return current;
  }

  public dispatchNotification(dto: DispatchNotificationDto): NotificationRecord | null {
    // 1. Idempotency & Deduplication check
    if (dto.deduplicationKey) {
      if (this.processedDeduplicationKeys.has(dto.deduplicationKey)) {
        return (
          this.notifications.find((n) => n.deduplicationKey === dto.deduplicationKey) ||
          null
        );
      }
      this.processedDeduplicationKeys.add(dto.deduplicationKey);
    }

    // 2. Preferences & Consent check
    const prefs = this.getPreferences(dto.userId);
    if (!prefs.inApp || !prefs.categories[dto.category]) {
      // User muted this category in-app
      return null;
    }

    // 3. Adapter Simulation for External Channels (Documented & Consent-Enforced)
    const externalDeliveryStatus: NotificationRecord["externalDeliveryStatus"] = {
      email: prefs.email ? "UNCONFIGURED" : "CONSENT_MISSING",
      sms: prefs.sms ? "UNCONFIGURED" : "CONSENT_MISSING",
      push: prefs.push ? "UNCONFIGURED" : "CONSENT_MISSING",
    };

    const notification: NotificationRecord = {
      id: `notif-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      tenantId: dto.tenantId || SEED_TENANT.id,
      userId: dto.userId,
      category: dto.category,
      priority: dto.priority || "NORMAL",
      title: dto.title,
      summary: dto.summary,
      actionUrl: dto.actionUrl,
      read: false,
      entityType: dto.entityType,
      entityId: dto.entityId,
      deduplicationKey: dto.deduplicationKey,
      externalDeliveryStatus,
      createdAt: new Date(),
    };

    this.notifications.unshift(notification);
    return notification;
  }

  public getNotificationsForUser(
    userId: string,
    categoryOrTenant?: NotificationCategory | string,
    unreadOnly?: boolean
  ): NotificationRecord[] {
    const isCategory =
      categoryOrTenant &&
      ["MESSAGES", "ANNOUNCEMENTS", "OPERATIONS", "FINANCE", "GOVERNANCE"].includes(
        categoryOrTenant
      );

    return this.notifications.filter((n) => {
      if (n.userId !== userId) return false;
      if (isCategory && n.category !== categoryOrTenant) return false;
      if (unreadOnly && n.read) return false;
      return true;
    });
  }

  public getUnreadCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.read).length;
  }

  public markAsRead(userId: string, notificationId: string): boolean {
    const notif = this.notifications.find(
      (n) => n.id === notificationId && n.userId === userId
    );
    if (notif) {
      notif.read = true;
      notif.readAt = new Date();
      return true;
    }
    return false;
  }

  public markAllAsRead(userId: string, category?: NotificationCategory): number {
    let count = 0;
    this.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        if (!category || n.category === category) {
          n.read = true;
          n.readAt = new Date();
          count++;
        }
      }
    });
    return count;
  }
}

export const notificationService = new NotificationService();
