import crypto from "crypto";
import { TenantContext } from "../../lib/types/common";
import { checkPermission, hasPropertyAccess } from "../../lib/auth/rbac";
import { SEED_USERS, SEED_TENANT, SEED_PROPERTIES } from "../../lib/db/seed";
import { notificationService } from "../notifications/notification-service";
import { createAuditLogEntry } from "../../lib/audit/logger";

export type AnnouncementStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "SCHEDULED"
  | "PUBLISHED"
  | "EXPIRED"
  | "CANCELLED";

export type AnnouncementAudienceType =
  | "ALL_STAFF"
  | "PROPERTY"
  | "DEPARTMENT"
  | "ROLE"
  | "GUESTS";

export type AnnouncementPriority = "NORMAL" | "HIGH" | "URGENT";

export interface AnnouncementReceipt {
  announcementId: string;
  userId: string;
  userName: string;
  acknowledgedAt: Date;
}

export interface AnnouncementRecord {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  audienceType: AnnouncementAudienceType;
  targetPropertyId?: string;
  targetPropertyName?: string;
  targetDepartment?: string;
  targetRole?: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishDate: Date;
  expirationDate?: Date;
  attachmentUrl?: string;
  attachmentName?: string;
  actionLink?: string;
  requiresAcknowledgment: boolean;
  secondApproverId?: string;
  secondApprovedAt?: Date;
  receiptsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  audienceType?: AnnouncementAudienceType;
  targetAudience?: string;
  targetPropertyId?: string;
  targetDepartment?: string;
  targetRole?: string;
  priority?: AnnouncementPriority;
  scheduledDate?: string; // ISO String
  expirationDate?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  actionLink?: string;
  requiresAcknowledgment?: boolean;
  autoPublish?: boolean;
  status?: AnnouncementStatus;
}

class AnnouncementService {
  private announcements: AnnouncementRecord[] = [];
  private receipts: AnnouncementReceipt[] = [];

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.announcements = [];
    this.receipts = [];
    this.seedDefaultAnnouncements();
  }

  private seedDefaultAnnouncements() {
    const ann1: AnnouncementRecord = {
      id: "ann-01",
      tenantId: SEED_TENANT.id,
      title: "Note de Service : Préparation de la Haute Saison & Réveillon 2026",
      content:
        "Toutes les équipes du Groupe Le Vignoble (Bohicon, Abomey, Calavi, Zogbodomey) sont invitées à vérifier les stocks de la cave à vin, l'état d'entretien des suites royales et la maintenance des groupes électrogènes avant le 20 décembre.",
      authorId: "user-prom-01",
      authorName: "Eddy GNACADJA",
      authorRole: "Promoteur",
      audienceType: "ALL_STAFF",
      priority: "HIGH",
      status: "PUBLISHED",
      publishDate: new Date(Date.now() - 3600000 * 24),
      requiresAcknowledgment: true,
      receiptsCount: 14,
      createdAt: new Date(Date.now() - 3600000 * 48),
      updatedAt: new Date(Date.now() - 3600000 * 24),
    };

    const ann2: AnnouncementRecord = {
      id: "ann-02",
      tenantId: SEED_TENANT.id,
      title: "Consignes d'Hygiène & Accueil VIP Agence Bohicon",
      content:
        "Rappel des protocoles d'accueil au restaurant et au bar. Tenue professionnelle complète exigée pour le service du soir.",
      authorId: "user-dir-boh",
      authorName: "Aimée Hounsinou",
      authorRole: "Directeur de Site",
      audienceType: "PROPERTY",
      targetPropertyId: "prop-bohicon-001",
      targetPropertyName: "Hôtel Le Vignoble - Bohicon",
      priority: "NORMAL",
      status: "PUBLISHED",
      publishDate: new Date(Date.now() - 3600000 * 12),
      requiresAcknowledgment: false,
      receiptsCount: 6,
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 12),
    };

    this.announcements.push(ann1, ann2);

    // Initial receipts
    this.receipts.push({
      announcementId: "ann-01",
      userId: "user-dir-boh",
      userName: "Aimée Hounsinou",
      acknowledgedAt: new Date(),
    });
  }

  public getAnnouncementById(id: string): AnnouncementRecord | undefined {
    return this.announcements.find((a) => a.id === id);
  }

  public listAnnouncementsForUser(
    context: TenantContext
  ): AnnouncementRecord[] {
    const isExecutive =
      context.roles.includes("PROMOTER") ||
      context.roles.includes("FINANCIAL_DIRECTOR");

    return this.announcements.filter((a) => {
      // Executives see everything (drafts, pending approval, published)
      if (isExecutive) return true;

      // Authors always see their own drafts and pending announcements
      if (a.authorId === context.userId) return true;

      // Staff only sees published announcements matching their scope
      if (a.status !== "PUBLISHED") return false;

      // Audience filtering
      if (a.audienceType === "ALL_STAFF") return true;

      if (a.audienceType === "PROPERTY") {
        return a.targetPropertyId === context.propertyId;
      }

      if (a.audienceType === "ROLE") {
        return context.roles.includes(a.targetRole as any);
      }

      return true;
    });
  }

  public listAnnouncements(context: TenantContext): AnnouncementRecord[] {
    return this.listAnnouncementsForUser(context);
  }

  public async createAnnouncement(
    context: TenantContext,
    dto: CreateAnnouncementDto
  ): Promise<AnnouncementRecord> {
    if (!checkPermission(context, "announcements:create")) {
      throw new Error("PERMISSION_DENIED: Droit de création d'annonces insuffisant.");
    }

    const isExecutive =
      context.roles.includes("PROMOTER") ||
      context.roles.includes("FINANCIAL_DIRECTOR");

    // Resolve audience type and target property
    let audienceType: AnnouncementAudienceType = dto.audienceType || "ALL_STAFF";
    if (dto.targetAudience === "ALL") audienceType = "ALL_STAFF";
    else if (dto.targetAudience === "PROPERTY") audienceType = "PROPERTY";
    else if (dto.targetAudience === "DEPARTMENT") audienceType = "DEPARTMENT";
    else if (dto.targetAudience === "ROLE") audienceType = "ROLE";

    const targetPropertyId =
      dto.targetPropertyId || (audienceType === "PROPERTY" ? context.propertyId || undefined : undefined);

    // Initial status determination
    let initialStatus: AnnouncementStatus = "PUBLISHED";
    if (dto.status === "DRAFT" || dto.autoPublish === false) {
      initialStatus = "DRAFT";
    } else if (dto.scheduledDate && new Date(dto.scheduledDate) > new Date()) {
      initialStatus = "SCHEDULED";
    } else if (!isExecutive && (dto.priority === "URGENT" || audienceType === "ALL_STAFF")) {
      // Urgent or group-wide announcement submitted by local manager requires hierarchical approval
      initialStatus = "PENDING_APPROVAL";
    }

    const authorUser = SEED_USERS.find((u) => u.id === context.userId);
    const authorName = authorUser?.fullName || "Responsable";
    const authorRole = authorUser?.roleName || "Direction";

    const targetPropertyName = targetPropertyId
      ? SEED_PROPERTIES.find((p) => p.id === targetPropertyId)?.name
      : undefined;

    const announcement: AnnouncementRecord = {
      id: `ann-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      tenantId: context.tenantId,
      title: dto.title,
      content: dto.content,
      authorId: context.userId,
      authorName,
      authorRole,
      audienceType,
      targetPropertyId,
      targetPropertyName,
      targetDepartment: dto.targetDepartment,
      targetRole: dto.targetRole,
      priority: dto.priority || "NORMAL",
      status: initialStatus,
      publishDate: dto.scheduledDate ? new Date(dto.scheduledDate) : new Date(),
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      attachmentUrl: dto.attachmentUrl,
      attachmentName: dto.attachmentName,
      actionLink: dto.actionLink,
      requiresAcknowledgment: Boolean(dto.requiresAcknowledgment),
      receiptsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.announcements.unshift(announcement);

    // If published immediately, dispatch notifications to target users
    if (initialStatus === "PUBLISHED") {
      this.dispatchAnnouncementNotifications(announcement);
    }

    createAuditLogEntry({
      tenantId: context.tenantId,
      propertyId: announcement.targetPropertyId,
      userId: context.userId,
      action: "ANNOUNCEMENT_CREATE",
      entityType: "ANNOUNCEMENT",
      entityId: announcement.id,
      details: { title: dto.title, audience: audienceType, status: initialStatus },
    });

    return announcement;
  }

  public async publishAnnouncement(
    context: TenantContext,
    announcementId: string
  ): Promise<AnnouncementRecord> {
    const ann = this.getAnnouncementById(announcementId);
    if (!ann) throw new Error("NOT_FOUND: Annonce introuvable.");

    const isExecutive =
      context.roles.includes("PROMOTER") ||
      context.roles.includes("FINANCIAL_DIRECTOR");

    if (ann.authorId !== context.userId && !isExecutive) {
      throw new Error("PERMISSION_DENIED: Seul l'auteur ou la Direction peut publier cette annonce.");
    }

    ann.status = "PUBLISHED";
    ann.publishDate = new Date();
    ann.updatedAt = new Date();

    this.dispatchAnnouncementNotifications(ann);
    return ann;
  }

  public async approveAnnouncement(
    context: TenantContext,
    announcementId: string
  ): Promise<AnnouncementRecord> {
    if (!checkPermission(context, "announcements:approve")) {
      throw new Error("PERMISSION_DENIED: Seule la Direction Générale peut approuver cette annonce.");
    }

    const ann = this.getAnnouncementById(announcementId);
    if (!ann || ann.status !== "PENDING_APPROVAL") {
      throw new Error("NOT_FOUND: Annonce introuvable ou statut incompatible.");
    }

    ann.status = "PUBLISHED";
    ann.secondApproverId = context.userId;
    ann.secondApprovedAt = new Date();
    ann.publishDate = new Date();
    ann.updatedAt = new Date();

    this.dispatchAnnouncementNotifications(ann);

    createAuditLogEntry({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "ANNOUNCEMENT_APPROVE",
      entityType: "ANNOUNCEMENT",
      entityId: ann.id,
      details: { title: ann.title },
    });

    return ann;
  }

  public async cancelAnnouncement(
    context: TenantContext,
    announcementId: string
  ): Promise<AnnouncementRecord> {
    const ann = this.getAnnouncementById(announcementId);
    if (!ann) throw new Error("NOT_FOUND: Annonce introuvable.");

    const isExecutive =
      context.roles.includes("PROMOTER") ||
      context.roles.includes("FINANCIAL_DIRECTOR");

    if (ann.authorId !== context.userId && !isExecutive) {
      throw new Error("PERMISSION_DENIED: Seul l'auteur ou la Direction peut annuler cette annonce.");
    }

    ann.status = "CANCELLED";
    ann.updatedAt = new Date();

    return ann;
  }

  public acknowledgeAnnouncement(
    arg1: TenantContext | string,
    arg2?: string,
    arg3?: string
  ): { success: boolean; acknowledged: boolean; receiptsCount: number } {
    let userId: string;
    let userName: string;
    let announcementId: string;

    if (typeof arg1 === "object" && arg1 !== null && "userId" in arg1) {
      userId = arg1.userId;
      announcementId = arg2 as string;
      const u = SEED_USERS.find((usr) => usr.id === userId);
      userName = u?.fullName || "Personnel";
    } else {
      userId = arg1 as string;
      userName = arg2 as string;
      announcementId = arg3 as string;
    }

    const ann = this.getAnnouncementById(announcementId);
    if (!ann || ann.status !== "PUBLISHED") {
      throw new Error("NOT_FOUND: Annonce publiée introuvable.");
    }

    const alreadyAck = this.receipts.some(
      (r) => r.announcementId === announcementId && r.userId === userId
    );

    if (!alreadyAck) {
      this.receipts.push({
        announcementId,
        userId,
        userName,
        acknowledgedAt: new Date(),
      });
      ann.receiptsCount = this.receipts.filter((r) => r.announcementId === announcementId).length;
    }

    return { success: true, acknowledged: true, receiptsCount: ann.receiptsCount };
  }

  public hasUserAcknowledged(userId: string, announcementId: string): boolean {
    return this.receipts.some(
      (r) => r.announcementId === announcementId && r.userId === userId
    );
  }

  public getAnnouncementReceipts(
    context: TenantContext,
    announcementId: string
  ): { totalAcknowledged: number; receipts: AnnouncementReceipt[] } {
    const ann = this.getAnnouncementById(announcementId);
    if (!ann) throw new Error("NOT_FOUND: Annonce introuvable.");

    const isExecutive =
      context.roles.includes("PROMOTER") ||
      context.roles.includes("FINANCIAL_DIRECTOR");

    if (ann.authorId !== context.userId && !isExecutive) {
      throw new Error("PERMISSION_DENIED: Seul l'auteur ou un responsable autorisé peut consulter les accusés d'émargement.");
    }

    const receipts = this.receipts.filter((r) => r.announcementId === announcementId);
    return {
      totalAcknowledged: receipts.length,
      receipts,
    };
  }

  public getReceiptsForAnnouncement(
    context: TenantContext,
    announcementId: string
  ): AnnouncementReceipt[] {
    return this.getAnnouncementReceipts(context, announcementId).receipts;
  }

  /**
   * Broadcasts notifications to all targeted users.
   * NOTE: Does NOT create any chat conversation! Links directly to `/announcements?id=<id>`.
   */
  private dispatchAnnouncementNotifications(ann: AnnouncementRecord) {
    const targetUsers = SEED_USERS.filter((u) => {
      if (ann.audienceType === "ALL_STAFF") return true;
      if (ann.audienceType === "PROPERTY" && ann.targetPropertyId) {
        return !u.propertyId || u.propertyId === ann.targetPropertyId;
      }
      if (ann.audienceType === "ROLE" && ann.targetRole) {
        return u.roleCode === ann.targetRole;
      }
      return true;
    });

    targetUsers.forEach((user) => {
      notificationService.dispatchNotification({
        tenantId: ann.tenantId,
        userId: user.id,
        category: "ANNOUNCEMENTS",
        priority: ann.priority,
        title: `Note Officielle : ${ann.title}`,
        summary: ann.content.slice(0, 120) + (ann.content.length > 120 ? "..." : ""),
        actionUrl: `/announcements?id=${ann.id}`, // DIRECT LINK TO ANNOUNCEMENTS (NEVER CONVERSATION)
        entityType: "ANNOUNCEMENT",
        entityId: ann.id,
        deduplicationKey: `notif-ann-${ann.id}-${user.id}`,
      });
    });
  }
}

export const announcementService = new AnnouncementService();
