import crypto from "crypto";
import { TenantContext } from "../../lib/types/common";
import { SEED_USERS, SEED_TENANT, SEED_PROPERTIES } from "../../lib/db/seed";
import { canSendMessageIntersite, hasPropertyAccess } from "../../lib/auth/rbac";
import { notificationService } from "../notifications/notification-service";
import { createAuditLogEntry } from "../../lib/audit/logger";

export type ConversationType = "DIRECT" | "GROUP";
export type MemberRole = "ADMIN" | "MEMBER";

export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
export type AttachmentType = "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";

export type CallStatus =
  | "INITIATING"
  | "RINGING"
  | "CONNECTED"
  | "ENDED"
  | "DECLINED"
  | "MISSED"
  | "FAILED";

export interface MessageAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  mimeType: string;
  sizeBytes: number;
  signedUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number; // for audio/voice notes & video
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachments?: MessageAttachment[];
  isVoiceNote?: boolean;
  status: MessageStatus;
  edited: boolean;
  deleted: boolean;
  replyToMessageId?: string;
  idempotencyKey?: string;
  readBy: { userId: string; readAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMember {
  userId: string;
  fullName: string;
  roleName: string;
  propertyId: string | null;
  role: MemberRole;
  joinedAt: Date;
  leftAt?: Date;
}

export interface ConversationRecord {
  id: string;
  tenantId: string;
  propertyId: string | null; // null = multi-site / group wide
  type: ConversationType;
  name: string;
  description?: string;
  avatarUrl?: string;
  members: ConversationMember[];
  lastMessage?: {
    id: string;
    senderName: string;
    content: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CallSessionRecord {
  id: string;
  conversationId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  status: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds: number;
  recordingEnabled: boolean; // strictly false by default
  sdpOffer?: string;
  sdpAnswer?: string;
  createdAt: Date;
}

const DISALLOWED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".php",
  ".py",
  ".js",
  ".vbs",
  ".msi",
  ".com",
  ".scr",
];

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "audio/",
  "video/",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml",
  "text/plain",
  "text/csv",
];

class MessagingService {
  private conversations: ConversationRecord[] = [];
  private messages: MessageRecord[] = [];
  private callSessions: CallSessionRecord[] = [];
  private processedIdempotencyKeys = new Set<string>();

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.conversations = [];
    this.messages = [];
    this.callSessions = [];
    this.processedIdempotencyKeys.clear();
    this.seedDefaultConversations();
  }

  private seedDefaultConversations() {
    // 1. Group: "Direction Générale & Gérants d'Agences"
    const dirGroup: ConversationRecord = {
      id: "conv-dir-group",
      tenantId: SEED_TENANT.id,
      propertyId: null,
      type: "GROUP",
      name: "Direction Générale & Gérants",
      description: "Coordination stratégique des 4 agences Le Vignoble",
      avatarUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80",
      members: [
        {
          userId: "user-prom-01",
          fullName: "Eddy GNACADJA",
          roleName: "Promoteur",
          propertyId: null,
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 7),
        },
        {
          userId: "user-daf-01",
          fullName: "Marcelin AGBIDINOUKOUN",
          roleName: "Directeur Administratif et Financier (DAF)",
          propertyId: null,
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 7),
        },
        {
          userId: "user-dir-boh",
          fullName: "Aimée Hounsinou",
          roleName: "Directeur de Site",
          propertyId: "prop-bohicon-001",
          role: "MEMBER",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 7),
        },
        {
          userId: "user-dir-abm",
          fullName: "Sylvain KPOFFON",
          roleName: "Gérant Agence Abomey",
          propertyId: "prop-abomey-002",
          role: "MEMBER",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 7),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 7),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    };

    // 2. Direct Conversation: Eddy GNACADJA <-> Marcelin AGBIDINOUKOUN
    const directConv: ConversationRecord = {
      id: "conv-direct-prom-daf",
      tenantId: SEED_TENANT.id,
      propertyId: null,
      type: "DIRECT",
      name: "Marcelin AGBIDINOUKOUN (DAF)",
      members: [
        {
          userId: "user-prom-01",
          fullName: "Eddy GNACADJA",
          roleName: "Promoteur",
          propertyId: null,
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 14),
        },
        {
          userId: "user-daf-01",
          fullName: "Marcelin AGBIDINOUKOUN",
          roleName: "Directeur Administratif et Financier (DAF)",
          propertyId: null,
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 14),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 14),
      updatedAt: new Date(Date.now() - 3600000 * 1),
    };

    // 3. Direct Conversation: Eddy GNACADJA <-> Aimée Hounsinou (Directrice Bohicon)
    const directBoh: ConversationRecord = {
      id: "conv-direct-prom-boh",
      tenantId: SEED_TENANT.id,
      propertyId: "prop-bohicon-001",
      type: "DIRECT",
      name: "Aimée Hounsinou (Bohicon)",
      members: [
        {
          userId: "user-prom-01",
          fullName: "Eddy GNACADJA",
          roleName: "Promoteur",
          propertyId: null,
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 10),
        },
        {
          userId: "user-dir-boh",
          fullName: "Aimée Hounsinou",
          roleName: "Directeur de Site",
          propertyId: "prop-bohicon-001",
          role: "MEMBER",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 10),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 10),
      updatedAt: new Date(Date.now() - 3600000 * 5),
    };

    // 4. Property Group: Bohicon Staff
    const bohiconStaff: ConversationRecord = {
      id: "conv_bohicon_staff",
      tenantId: SEED_TENANT.id,
      propertyId: "prop-bohicon-001",
      type: "GROUP",
      name: "Équipe Hôtel Le Vignoble - Bohicon",
      description: "Canal opérationnel général de l'établissement de Bohicon",
      members: [
        {
          userId: "user-prom-01",
          fullName: "Eddy GNACADJA",
          roleName: "Promoteur",
          propertyId: null,
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 30),
        },
        {
          userId: "user-dir-boh",
          fullName: "Aimée Hounsinou",
          roleName: "Directeur de Site",
          propertyId: "prop-bohicon-001",
          role: "ADMIN",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 30),
        },
        {
          userId: "user-rec-boh",
          fullName: "Reine KPONHINTO",
          roleName: "Réceptionniste",
          propertyId: "prop-bohicon-001",
          role: "MEMBER",
          joinedAt: new Date(Date.now() - 3600000 * 24 * 30),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 30),
      updatedAt: new Date(Date.now() - 3600000 * 1),
    };

    this.conversations.push(dirGroup, directConv, directBoh, bohiconStaff);

    // Initial messages
    this.messages.push(
      {
        id: "msg-01",
        conversationId: "conv-dir-group",
        senderId: "user-prom-01",
        senderName: "Eddy GNACADJA",
        senderRole: "Promoteur",
        content: "Bonjour à tous les gérants. Merci de vérifier vos stocks de grands crus et le planning des fêtes.",
        status: "READ",
        edited: false,
        deleted: false,
        readBy: [
          { userId: "user-daf-01", readAt: new Date() },
          { userId: "user-dir-boh", readAt: new Date() },
        ],
        createdAt: new Date(Date.now() - 3600000 * 3),
        updatedAt: new Date(Date.now() - 3600000 * 3),
      },
      {
        id: "msg-02",
        conversationId: "conv-dir-group",
        senderId: "user-dir-boh",
        senderName: "Aimée Hounsinou",
        senderRole: "Directeur de Site",
        content: "Bien reçu M. le Promoteur. À Bohicon, le réassort de champagne Moët et Châteauneuf est déjà vérifié.",
        status: "READ",
        edited: false,
        deleted: false,
        readBy: [{ userId: "user-prom-01", readAt: new Date() }],
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "msg-03",
        conversationId: "conv-direct-prom-daf",
        senderId: "user-daf-01",
        senderName: "Marcelin AGBIDINOUKOUN",
        senderRole: "Directeur Administratif et Financier (DAF)",
        content: "Monsieur le Promoteur, le rapport de clôture SYSCOHADA pour l'ensemble des 4 agences est disponible.",
        status: "DELIVERED",
        edited: false,
        deleted: false,
        readBy: [],
        createdAt: new Date(Date.now() - 3600000 * 1),
        updatedAt: new Date(Date.now() - 3600000 * 1),
      }
    );

    dirGroup.lastMessage = {
      id: "msg-02",
      senderName: "Aimée Hounsinou",
      content: "Bien reçu M. le Promoteur. À Bohicon, le réassort de champagne Moët et Châteauneuf est déjà vérifié.",
      createdAt: new Date(Date.now() - 3600000 * 2),
    };

    directConv.lastMessage = {
      id: "msg-03",
      senderName: "Marcelin AGBIDINOUKOUN",
      content: "Monsieur le Promoteur, le rapport de clôture SYSCOHADA pour l'ensemble des 4 agences est disponible.",
      createdAt: new Date(Date.now() - 3600000 * 1),
    };
  }

  public getConversationById(id: string): ConversationRecord | null {
    return this.conversations.find((c) => c.id === id) || null;
  }

  public listConversationsForUser(
    context: TenantContext,
    searchQuery?: string
  ): ConversationRecord[] {
    if (context.tenantId !== SEED_TENANT.id) {
      throw new Error("PERMISSION_DENIED: Accès refusé inter-tenant.");
    }
    if (context.roles.includes("CLIENT") || !context.roles.some((r) => r !== "CLIENT")) {
      throw new Error("PERMISSION_DENIED: Accès refusé. La messagerie interne est strictement réservée au personnel de l'établissement.");
    }

    return this.conversations.filter((c) => {
      // Must be an active member of the conversation
      const isMember = c.members.some((m) => m.userId === context.userId && !m.leftAt);
      if (!isMember) return false;

      // Intersite restrictions: if user does not have intersite permissions and conversation is outside site
      if (c.propertyId && c.propertyId !== context.propertyId && !canSendMessageIntersite(context, c.propertyId)) {
        return false;
      }

      // Search query filtering
      if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesLast = c.lastMessage?.content.toLowerCase().includes(query);
        return matchesName || matchesLast;
      }

      return true;
    });
  }

  public getUnreadMessagesCount(userId: string): number {
    return this.messages.filter((m) => {
      if (m.senderId === userId || m.deleted) return false;
      // Check if user is a member of the conversation
      const conv = this.getConversationById(m.conversationId);
      if (!conv || !conv.members.some((mem) => mem.userId === userId && !mem.leftAt)) {
        return false;
      }
      return !m.readBy.some((r) => r.userId === userId);
    }).length;
  }

  public addMemberToGroup(conversationId: string, userId: string, role: MemberRole = "MEMBER") {
    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error("NOT_FOUND: Conversation introuvable.");
    if (conv.type !== "GROUP") throw new Error("VALIDATION_ERROR: Impossible d'ajouter des membres à une conversation directe.");

    const existing = conv.members.find((m) => m.userId === userId);
    if (existing) {
      existing.leftAt = undefined;
      existing.role = role;
      return conv;
    }

    const user = SEED_USERS.find((u) => u.id === userId);
    conv.members.push({
      userId,
      fullName: user?.fullName || "Collaborateur",
      roleName: user?.roleName || "Personnel",
      propertyId: user?.propertyId || null,
      role,
      joinedAt: new Date(),
    });
    return conv;
  }

  public removeMemberFromGroup(
    arg1: TenantContext | string,
    arg2: string,
    arg3?: string
  ): { success: boolean } {
    let conversationId: string;
    let targetUserId: string;

    if (typeof arg1 === "object" && arg1 !== null && "userId" in arg1) {
      conversationId = arg2;
      targetUserId = arg3 as string;
    } else {
      conversationId = arg1 as string;
      targetUserId = arg2;
    }

    const conv = this.getConversationById(conversationId);
    if (!conv || conv.type !== "GROUP") {
      throw new Error("NOT_FOUND: Groupe introuvable.");
    }

    const targetMember = conv.members.find((m) => m.userId === targetUserId && !m.leftAt);
    if (!targetMember) {
      throw new Error("NOT_FOUND: Membre introuvable dans ce groupe.");
    }

    targetMember.leftAt = new Date();
    return { success: true };
  }

  public getOrCreateDirectConversation(
    context: TenantContext,
    targetUserId: string
  ): ConversationRecord {
    if (context.roles.includes("CLIENT")) {
      throw new Error("PERMISSION_DENIED: Accès refusé. La messagerie interne est strictement réservée au personnel de l'établissement.");
    }

    const targetUser = SEED_USERS.find((u) => u.id === targetUserId);
    if (!targetUser) throw new Error("NOT_FOUND: Utilisateur cible introuvable.");

    // Check intersite permission
    if (
      targetUser.propertyId &&
      targetUser.propertyId !== context.propertyId &&
      !canSendMessageIntersite(context, targetUser.propertyId)
    ) {
      throw new Error("PERMISSION_DENIED: Communication inter-sites non autorisée pour votre rôle.");
    }

    // Check existing
    const existing = this.conversations.find(
      (c) =>
        c.type === "DIRECT" &&
        c.members.some((m) => m.userId === context.userId) &&
        c.members.some((m) => m.userId === targetUserId)
    );
    if (existing) return existing;

    const currentUser = SEED_USERS.find((u) => u.id === context.userId);
    const newConv: ConversationRecord = {
      id: `conv-direct-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      tenantId: context.tenantId,
      propertyId: context.propertyId,
      type: "DIRECT",
      name: `${targetUser.fullName} (${targetUser.roleName})`,
      members: [
        {
          userId: context.userId,
          fullName: currentUser?.fullName || "Personnel",
          roleName: currentUser?.roleName || "Personnel",
          propertyId: context.propertyId,
          role: "ADMIN",
          joinedAt: new Date(),
        },
        {
          userId: targetUser.id,
          fullName: targetUser.fullName,
          roleName: targetUser.roleName,
          propertyId: targetUser.propertyId,
          role: "MEMBER",
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.unshift(newConv);
    return newConv;
  }

  public getMessagesByConversation(
    context: TenantContext,
    conversationId: string
  ): MessageRecord[] {
    if (context.tenantId !== SEED_TENANT.id) {
      throw new Error("PERMISSION_DENIED: Accès refusé inter-tenant.");
    }
    if (context.roles.includes("CLIENT") || !context.roles.some((r) => r !== "CLIENT")) {
      throw new Error("PERMISSION_DENIED: Accès refusé. La messagerie interne est strictement réservée au personnel de l'établissement.");
    }

    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error("NOT_FOUND: Conversation introuvable.");

    // Membership check: only members can read conversation history
    const member = conv.members.find((m) => m.userId === context.userId);
    if (!member) {
      throw new Error("PERMISSION_DENIED: Vous ne faites pas partie de cette conversation.");
    }

    return this.messages.filter((m) => {
      if (m.conversationId !== conversationId) return false;
      // If member left the group, check if they can see messages after leaving
      if (member.leftAt && m.createdAt > member.leftAt) return false;
      return true;
    });
  }

  public async sendMessage(
    context: TenantContext,
    conversationId: string,
    content: string,
    options: {
      attachments?: MessageAttachment[];
      isVoiceNote?: boolean;
      replyToMessageId?: string;
      idempotencyKey?: string;
    } = {}
  ): Promise<MessageRecord> {
    if (context.tenantId !== SEED_TENANT.id) {
      throw new Error("PERMISSION_DENIED: Accès refusé inter-tenant.");
    }
    if (context.roles.includes("CLIENT") || !context.roles.some((r) => r !== "CLIENT")) {
      throw new Error("PERMISSION_DENIED: Accès refusé. La messagerie interne est strictement réservée au personnel de l'établissement.");
    }

    const conv = this.getConversationById(conversationId);
    if (!conv) throw new Error("NOT_FOUND: Conversation introuvable.");

    const member = conv.members.find((m) => m.userId === context.userId && !m.leftAt);
    if (!member) {
      throw new Error("PERMISSION_DENIED: Vous ne faites pas partie de cette conversation ou n'est pas membre actif.");
    }

    // Intersite permission check
    if (conv.propertyId && conv.propertyId !== context.propertyId && !canSendMessageIntersite(context, conv.propertyId)) {
      throw new Error("PERMISSION_DENIED: Envoi intersites non autorisé.");
    }

    // Idempotency check: prevent duplicate message submissions on retries
    if (options.idempotencyKey) {
      if (this.processedIdempotencyKeys.has(options.idempotencyKey)) {
        const existing = this.messages.find(
          (m) => m.idempotencyKey === options.idempotencyKey
        );
        if (existing) return existing;
      }
      this.processedIdempotencyKeys.add(options.idempotencyKey);
    }

    const senderUser = SEED_USERS.find((u) => u.id === context.userId);
    const senderName = senderUser?.fullName || "Collaborateur";
    const senderRole = senderUser?.roleName || "Personnel";

    // Validate attachments if present
    if (options.attachments) {
      for (const att of options.attachments) {
        this.validateAttachment(att);
      }
    }

    const message: MessageRecord = {
      id: `msg-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      conversationId,
      senderId: context.userId,
      senderName,
      senderRole,
      content,
      attachments: options.attachments,
      isVoiceNote: options.isVoiceNote,
      status: "SENT",
      edited: false,
      deleted: false,
      replyToMessageId: options.replyToMessageId,
      idempotencyKey: options.idempotencyKey,
      readBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.messages.push(message);

    // Update conversation last message
    conv.lastMessage = {
      id: message.id,
      senderName,
      content: options.isVoiceNote ? "🎤 Note vocale" : content,
      createdAt: message.createdAt,
    };
    conv.updatedAt = message.createdAt;

    // Dispatch notifications to all OTHER active members of the conversation
    conv.members.forEach((m) => {
      if (m.userId !== context.userId && !m.leftAt) {
        notificationService.dispatchNotification({
          tenantId: conv.tenantId,
          userId: m.userId,
          category: "MESSAGES",
          priority: "NORMAL",
          title: `Nouveau message de ${senderName}`,
          summary: options.isVoiceNote
            ? "🎤 Note vocale reçue"
            : content.slice(0, 80) + (content.length > 80 ? "..." : ""),
          actionUrl: `/messaging?conversationId=${conv.id}`,
          entityType: "CONVERSATION",
          entityId: conv.id,
          deduplicationKey: `notif-msg-${message.id}-${m.userId}`,
        });
      }
    });

    return message;
  }

  public validateAttachment(att: MessageAttachment) {
    // 1. Check size (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (att.sizeBytes > MAX_SIZE) {
      throw new Error(`VALIDATION_ERROR: Le fichier dépasse la taille maximale autorisée de 15 Mo.`);
    }

    // 2. Block dangerous executable extensions
    const ext = att.name.toLowerCase().slice(att.name.lastIndexOf("."));
    if (DISALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`SECURITY_ERROR: Type de fichier et extension interdite (${ext}) pour des raisons de sécurité.`);
    }

    // 3. Allowed MIME types
    const isAllowedMime = ALLOWED_MIME_PREFIXES.some((prefix) =>
      att.mimeType.toLowerCase().startsWith(prefix)
    );
    if (!isAllowedMime) {
      throw new Error(`SECURITY_ERROR: Format MIME (${att.mimeType}) non autorisé.`);
    }
  }

  public editMessage(
    context: TenantContext,
    messageId: string,
    newContent: string
  ): MessageRecord {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message || message.deleted) {
      throw new Error("NOT_FOUND: Message introuvable ou supprimé.");
    }

    if (message.senderId !== context.userId) {
      throw new Error("PERMISSION_DENIED: Seul l'auteur peut modifier son message.");
    }

    message.content = newContent;
    message.edited = true;
    message.updatedAt = new Date();

    return message;
  }

  public deleteMessage(
    context: TenantContext,
    messageId: string
  ): { success: boolean } {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) throw new Error("NOT_FOUND: Message introuvable.");

    const isPromoter = context.roles.includes("PROMOTER");
    if (message.senderId !== context.userId && !isPromoter) {
      throw new Error("PERMISSION_DENIED: Seul l'auteur ou le promoteur peut supprimer ce message.");
    }

    message.deleted = true;
    message.content = "Ce message a été supprimé.";
    message.attachments = undefined;
    message.updatedAt = new Date();

    return { success: true };
  }

  public markMessageAsRead(userId: string, messageId: string): boolean {
    const message = this.messages.find((m) => m.id === messageId);
    if (!message) return false;

    if (!message.readBy.some((r) => r.userId === userId)) {
      message.readBy.push({ userId, readAt: new Date() });
      message.status = "READ";
      return true;
    }
    return false;
  }

  public markConversationAsRead(userId: string, conversationId: string): number {
    let count = 0;
    this.messages.forEach((m) => {
      if (m.conversationId === conversationId && m.senderId !== userId) {
        if (!m.readBy.some((r) => r.userId === userId)) {
          m.readBy.push({ userId, readAt: new Date() });
          m.status = "READ";
          count++;
        }
      }
    });
    return count;
  }

  public createGroup(
    context: TenantContext,
    name: string,
    description?: string,
    memberUserIds: string[] = [],
    avatarUrl?: string
  ): ConversationRecord {
    if (!context.permissions.includes("messaging:groups:create")) {
      throw new Error("PERMISSION_DENIED: Droit de création de groupe insuffisant.");
    }

    const creator = SEED_USERS.find((u) => u.id === context.userId);
    const members: ConversationMember[] = [
      {
        userId: context.userId,
        fullName: creator?.fullName || "Créateur",
        roleName: creator?.roleName || "Direction",
        propertyId: context.propertyId,
        role: "ADMIN",
        joinedAt: new Date(),
      },
    ];

    // Add selected members
    memberUserIds.forEach((uid) => {
      if (uid !== context.userId) {
        const u = SEED_USERS.find((user) => user.id === uid);
        if (u) {
          members.push({
            userId: u.id,
            fullName: u.fullName,
            roleName: u.roleName,
            propertyId: u.propertyId,
            role: "MEMBER",
            joinedAt: new Date(),
          });
        }
      }
    });

    const group: ConversationRecord = {
      id: `conv-group-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      tenantId: context.tenantId,
      propertyId: context.propertyId,
      type: "GROUP",
      name,
      description,
      avatarUrl,
      members,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.push(group);
    return group;
  }

  // =========================================================================
  // WebRTC Voice Calls State Machine
  // =========================================================================

  public initiateCall(
    context: TenantContext,
    receiverUserId: string,
    conversationId?: string,
    sdpOffer?: string
  ): CallSessionRecord {
    const caller = SEED_USERS.find((u) => u.id === context.userId);
    const receiver = SEED_USERS.find((u) => u.id === receiverUserId);

    if (!receiver) {
      throw new Error("NOT_FOUND: Destinataire de l'appel introuvable.");
    }

    const call: CallSessionRecord = {
      id: `call-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      conversationId: conversationId || `call-conv-${Date.now()}`,
      callerId: context.userId,
      callerName: caller?.fullName || "Collaborateur",
      receiverId: receiver.id,
      receiverName: receiver.fullName,
      status: "RINGING",
      durationSeconds: 0,
      recordingEnabled: false, // strictly false
      sdpOffer,
      createdAt: new Date(),
    };

    this.callSessions.push(call);

    // Notify receiver about incoming call
    notificationService.dispatchNotification({
      tenantId: context.tenantId,
      userId: receiver.id,
      category: "MESSAGES",
      priority: "URGENT",
      title: `Appel vocal entrant de ${caller?.fullName}`,
      summary: "Cliquez pour répondre à l'appel interne sécurisé.",
      actionUrl: `/messaging?callId=${call.id}`,
      deduplicationKey: `notif-call-${call.id}`,
    });

    return call;
  }

  public answerCall(
    callId: string,
    receiverUserId: string,
    sdpAnswer?: string
  ): CallSessionRecord {
    const call = this.callSessions.find((c) => c.id === callId);
    if (!call || call.receiverId !== receiverUserId) {
      throw new Error("NOT_FOUND: Appel introuvable ou non autorisé.");
    }

    call.status = "CONNECTED";
    call.startedAt = new Date();
    call.sdpAnswer = sdpAnswer;

    return call;
  }

  public endCall(
    callId: string,
    userId: string,
    status: "ENDED" | "DECLINED" = "ENDED"
  ): CallSessionRecord {
    const call = this.callSessions.find((c) => c.id === callId);
    if (!call) throw new Error("NOT_FOUND: Session d'appel introuvable.");

    call.status = status;
    call.endedAt = new Date();

    if (call.startedAt) {
      call.durationSeconds = Math.max(
        0,
        Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000)
      );
    }

    return call;
  }

  public getCallSession(callId: string): CallSessionRecord | undefined {
    return this.callSessions.find((c) => c.id === callId);
  }
}

export const messagingService = new MessagingService();
