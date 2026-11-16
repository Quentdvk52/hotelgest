import { describe, it, expect, beforeEach } from "vitest";
import { messagingService } from "../modules/messaging/messaging-service";
import { announcementService } from "../modules/announcements/announcement-service";
import { notificationService } from "../modules/notifications/notification-service";
import { TenantContext } from "../lib/types/common";
import { getRoleDefaultPermissions } from "../lib/auth/rbac";

describe("Internal Messaging, Announcements & Notification Center Suite (13 Acceptance Criteria)", () => {
  // Test contexts
  const bohiconReceptionist: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-rec-boh",
    roles: ["RECEPTIONIST"],
    permissions: getRoleDefaultPermissions("RECEPTIONIST"),
  };

  const bohiconManager: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-dir-boh",
    roles: ["PROPERTY_MANAGER"],
    permissions: getRoleDefaultPermissions("PROPERTY_MANAGER"),
  };

  const abomeyManager: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-abomey-002",
    userId: "user-dir-abm",
    roles: ["PROPERTY_MANAGER"],
    permissions: getRoleDefaultPermissions("PROPERTY_MANAGER"),
  };

  const promoterContext: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001", // Full group / multi-site scope
    userId: "user-prom-01",
    roles: ["PROMOTER"],
    permissions: getRoleDefaultPermissions("PROMOTER"),
  };

  const clientContext: TenantContext = {
    tenantId: "tenant-vignoble-001",
    organizationId: "org-vignoble-001",
    propertyId: "prop-bohicon-001",
    userId: "user-client-999",
    roles: ["CLIENT"],
    permissions: [],
  };

  const otherTenantContext: TenantContext = {
    tenantId: "tenant-foreign-999",
    organizationId: "org-foreign-999",
    propertyId: "prop-foreign-999",
    userId: "user-foreign-001",
    roles: ["PROPERTY_MANAGER"],
    permissions: getRoleDefaultPermissions("PROPERTY_MANAGER"),
  };

  beforeEach(() => {
    messagingService.resetState();
    announcementService.resetState();
    notificationService.resetState();
  });

  // 1. Échange entre membres d'un même établissement et blocage inter-tenant
  describe("1. Same-property staff exchange vs cross-tenant & unauthorized intersite block", () => {
    it("allows staff members of the same property to send and receive messages", async () => {
      const msg = await messagingService.sendMessage(
        bohiconReceptionist,
        "conv_bohicon_staff",
        "Arrivée imminente d'un client VIP pour la suite 102."
      );
      expect(msg.id).toBeDefined();
      expect(msg.content).toContain("client VIP");
      expect(msg.senderId).toBe("user-rec-boh");

      const msgs = messagingService.getMessagesByConversation(bohiconManager, "conv_bohicon_staff");
      expect(msgs.some((m) => m.id === msg.id)).toBe(true);
    });

    it("strictly blocks cross-tenant access to messaging", async () => {
      await expect(
        messagingService.sendMessage(
          otherTenantContext,
          "conv_bohicon_staff",
          "Message intrusif venant d'un autre tenant"
        )
      ).rejects.toThrow(/Accès refusé|inter-tenant/);
    });

    it("blocks non-executive staff from unauthorized intersite conversation creation", () => {
      expect(() => {
        messagingService.getOrCreateDirectConversation(
          bohiconReceptionist,
          "user-dir-abm" // Staff at Abomey
        );
      }).toThrow(/inter-sites non autorisée/);
    });
  });

  // 2. Refus d'accès pour les comptes clients
  describe("2. Strict denial of access for client accounts (no leak)", () => {
    it("rejects client attempts to list internal conversations", () => {
      expect(() => {
        messagingService.listConversationsForUser(clientContext);
      }).toThrow(/strictement réservée au personnel/);
    });

    it("rejects client attempts to read conversation messages", () => {
      expect(() => {
        messagingService.getMessagesByConversation(clientContext, "conv_bohicon_staff");
      }).toThrow(/strictement réservée au personnel/);
    });

    it("rejects client attempts to post internal messages", async () => {
      await expect(
        messagingService.sendMessage(clientContext, "conv_bohicon_staff", "Je veux parler au gérant.")
      ).rejects.toThrow(/strictement réservée au personnel/);
    });
  });

  // 3. Mise à jour de l'adhésion à un groupe et application de la politique d'historique
  describe("3. Group membership lifecycle and history retention policy", () => {
    it("handles adding and removing group members with history enforcement", async () => {
      const group = messagingService.createGroup(
        bohiconManager,
        "Équipe Cuisine & Bar Bohicon",
        "Coordination des services",
        ["user-rec-boh"]
      );

      expect(group.members.some((m) => m.userId === "user-rec-boh")).toBe(true);

      // Add a third member
      messagingService.addMemberToGroup(group.id, "user-daf-01");
      const updated = messagingService.getConversationById(group.id);
      expect(updated?.members.some((m) => m.userId === "user-daf-01")).toBe(true);

      // Remove member
      messagingService.removeMemberFromGroup(group.id, "user-rec-boh");
      const afterRemoval = messagingService.getConversationById(group.id);
      const removedMember = afterRemoval?.members.find((m) => m.userId === "user-rec-boh");
      expect(removedMember?.leftAt).toBeDefined();

      // Removed member cannot send new messages to this group
      await expect(
        messagingService.sendMessage(bohiconReceptionist, group.id, "Message après départ")
      ).rejects.toThrow(/n'est pas membre actif/);
    });
  });

  // 4. Validation et rejet des pièces jointes
  describe("4. Attachment security validation and rejection of dangerous/oversized files", () => {
    it("rejects executable or script extensions immediately (.exe, .sh, .bat)", async () => {
      await expect(
        messagingService.sendMessage(bohiconReceptionist, "conv_bohicon_staff", "Fichier joint", {
          attachments: [
            {
              id: "att-malware",
              name: "malware.exe",
              type: "DOCUMENT",
              mimeType: "application/x-msdownload",
              sizeBytes: 1024,
              signedUrl: "https://example.com/malware.exe",
            },
          ],
        })
      ).rejects.toThrow(/extension interdite/);
    });

    it("rejects attachments exceeding the 15MB size limit", async () => {
      const sixteenMb = 16 * 1024 * 1024;
      await expect(
        messagingService.sendMessage(bohiconReceptionist, "conv_bohicon_staff", "Gros fichier", {
          attachments: [
            {
              id: "att-huge",
              name: "huge_video.mp4",
              type: "VIDEO",
              mimeType: "video/mp4",
              sizeBytes: sixteenMb,
              signedUrl: "https://example.com/huge.mp4",
            },
          ],
        })
      ).rejects.toThrow(/dépasse la taille maximale/);
    });

    it("accepts valid attachments under 15MB with allowed types (PDF, PNG)", async () => {
      const msg = await messagingService.sendMessage(
        bohiconReceptionist,
        "conv_bohicon_staff",
        "Facture fournisseur vérifiée",
        {
          attachments: [
            {
              id: "att-facture",
              name: "facture_lingerie.pdf",
              type: "DOCUMENT",
              mimeType: "application/pdf",
              sizeBytes: 250 * 1024,
              signedUrl: "https://example.com/facture.pdf",
            },
          ],
        }
      );
      expect(msg.attachments).toBeDefined();
      expect(msg.attachments?.[0].name).toBe("facture_lingerie.pdf");
    });
  });

  // 5. Idempotence de l'envoi
  describe("5. Idempotent message sending (deduplication on network retries)", () => {
    it("returns existing message reference on repeated identical idempotencyKey", async () => {
      const idempotencyKey = "key_retry_abc_123";

      const firstSend = await messagingService.sendMessage(
        bohiconReceptionist,
        "conv_bohicon_staff",
        "Rapport de relève d'équipe 14h.",
        { idempotencyKey }
      );

      const secondSend = await messagingService.sendMessage(
        bohiconReceptionist,
        "conv_bohicon_staff",
        "Rapport de relève d'équipe 14h.",
        { idempotencyKey }
      );

      expect(firstSend.id).toBe(secondSend.id);
      expect(firstSend.createdAt).toEqual(secondSend.createdAt);

      const allMsgs = messagingService.getMessagesByConversation(bohiconManager, "conv_bohicon_staff");
      const matched = allMsgs.filter((m) => m.idempotencyKey === idempotencyKey);
      expect(matched.length).toBe(1);
    });
  });

  // 6. Machine d'états d'un appel audio WebRTC
  describe("6. Audio call state machine transitions and no unconsented recording", () => {
    it("progresses through INITIATING -> RINGING -> CONNECTED -> ENDED", () => {
      const call = messagingService.initiateCall(
        bohiconManager,
        "user-daf-01",
        "conv_direction_groupe",
        "sdp-offer-mock"
      );

      expect(call.status).toBe("RINGING");
      expect(call.recordingEnabled).toBe(false); // strictly no audio recording by default

      const answered = messagingService.answerCall(call.id, "user-daf-01", "sdp-answer-mock");
      expect(answered.status).toBe("CONNECTED");
      expect(answered.startedAt).toBeDefined();

      const ended = messagingService.endCall(call.id, "user-daf-01", "ENDED");
      expect(ended.status).toBe("ENDED");
      expect(ended.endedAt).toBeDefined();
    });

    it("handles call decline transition properly", () => {
      const call = messagingService.initiateCall(
        bohiconManager,
        "user-daf-01",
        "conv_direction_groupe"
      );

      const declined = messagingService.endCall(call.id, "user-daf-01", "DECLINED");
      expect(declined.status).toBe("DECLINED");
    });
  });

  // 7. Restriction de portée d'une annonce
  describe("7. Scope restriction for announcements (site vs group-wide)", () => {
    it("requires executive approval when site manager attempts group-wide urgent announcement", async () => {
      const result = await announcementService.createAnnouncement(bohiconManager, {
        title: "Urgence coupure générale groupe",
        content: "Consignes de sécurité pour tous les sites.",
        priority: "URGENT",
        targetAudience: "ALL", // targets all sites without group scope
      });

      // Needs approval because site manager doesn't have group scope
      expect(result.status).toBe("PENDING_APPROVAL");
    });

    it("allows promoter to publish multi-site announcement directly", async () => {
      const result = await announcementService.createAnnouncement(promoterContext, {
        title: "Message de la Présidence",
        content: "Directives stratégiques annuelles du Groupe Le Vignoble.",
        priority: "HIGH",
        targetAudience: "ALL",
        autoPublish: true,
      });

      expect(result.status).toBe("PUBLISHED");
    });
  });

  // 8. Cycle de vie complet d'une annonce
  describe("8. Announcement full lifecycle (DRAFT -> PUBLISHED -> CANCELLED/EXPIRED)", () => {
    it("transitions draft to published then cancelled and updates accessibility", async () => {
      const draft = await announcementService.createAnnouncement(bohiconManager, {
        title: "Maintenance ascenseur Bohicon",
        content: "Intervention technique jeudi matin.",
        priority: "NORMAL",
        targetAudience: "PROPERTY",
        autoPublish: false,
      });
      expect(draft.status).toBe("DRAFT");

      const published = await announcementService.publishAnnouncement(bohiconManager, draft.id);
      expect(published.status).toBe("PUBLISHED");

      const cancelled = await announcementService.cancelAnnouncement(
        bohiconManager,
        draft.id
      );
      expect(cancelled.status).toBe("CANCELLED");

      // Verify it is not listed in active published announcements
      const activeList = announcementService.listAnnouncements(bohiconReceptionist);
      expect(activeList.some((a) => a.id === draft.id)).toBe(false);
    });
  });

  // 9. Production de notification lors de la publication d'une annonce sans création de conversation
  describe("9. Announcement publication creates notification without creating chat conversation", () => {
    it("dispatches notification to target audience and leaves messaging conversations untouched", async () => {
      const convsBefore = messagingService.listConversationsForUser(bohiconReceptionist).length;

      const ann = await announcementService.createAnnouncement(bohiconManager, {
        title: "Nouvelle grille tarifaire bar",
        content: "Mise à jour des prix des champagnes et spiritueux dès ce soir.",
        priority: "HIGH",
        targetAudience: "PROPERTY",
        autoPublish: true,
      });

      expect(ann.status).toBe("PUBLISHED");

      // Check notification received by Bohicon staff
      const userNotifs = notificationService.getNotificationsForUser(
        bohiconReceptionist.userId,
        bohiconReceptionist.tenantId
      );
      const annNotif = userNotifs.find((n) => n.category === "ANNOUNCEMENTS");
      expect(annNotif).toBeDefined();
      expect(annNotif?.title).toContain("Nouvelle grille tarifaire bar");

      // Crucial requirement: No messaging conversation was automatically created!
      const convsAfter = messagingService.listConversationsForUser(bohiconReceptionist).length;
      expect(convsAfter).toBe(convsBefore);
    });
  });

  // 10. Aiguillage correct depuis le centre de notifications
  describe("10. Correct routing links in notification center (Announcements -> /announcements, Messages -> /messaging)", () => {
    it("routes announcement notifications strictly to /announcements?id=...", async () => {
      const ann = await announcementService.createAnnouncement(promoterContext, {
        title: "Note de service officielle",
        content: "Application stricte des procédures HACCP en cuisine.",
        priority: "HIGH",
        targetAudience: "ALL",
        autoPublish: true,
      });

      const notifs = notificationService.getNotificationsForUser("user-rec-boh", "tenant-vignoble-001");
      const annNotif = notifs.find((n) => n.category === "ANNOUNCEMENTS");

      expect(annNotif?.actionUrl).toBe(`/announcements?id=${ann.id}`);
      expect(annNotif?.actionUrl).not.toContain("/messaging");
    });

    it("routes message notifications strictly to /messaging?conversationId=...", async () => {
      await messagingService.sendMessage(
        bohiconManager,
        "conv_bohicon_staff",
        "Veuillez vérifier le coffre de la réception."
      );

      const notifs = notificationService.getNotificationsForUser("user-rec-boh", "tenant-vignoble-001");
      const msgNotif = notifs.find((n) => n.category === "MESSAGES");

      expect(msgNotif?.actionUrl).toBe("/messaging?conversationId=conv_bohicon_staff");
      expect(msgNotif?.actionUrl).not.toContain("/announcements");
    });
  });

  // 11. Accès restreint à la liste d'émargement (« J'ai pris connaissance »)
  describe("11. Restricted access to acknowledgment receipts (author/managers only)", () => {
    it("allows employees to acknowledge an announcement and tracks their receipt", async () => {
      const ann = await announcementService.createAnnouncement(bohiconManager, {
        title: "Consigne vestiaires personnel",
        content: "Casiers obligatoirement verrouillés en fin de service.",
        priority: "NORMAL",
        targetAudience: "PROPERTY",
        autoPublish: true,
      });

      const ack = announcementService.acknowledgeAnnouncement(bohiconReceptionist, ann.id);
      expect(ack.acknowledged).toBe(true);

      // Bohicon Manager (author) can inspect full receipts list
      const receipts = announcementService.getAnnouncementReceipts(bohiconManager, ann.id);
      expect(receipts.totalAcknowledged).toBe(1);
      expect(receipts.receipts.some((r) => r.userId === "user-rec-boh")).toBe(true);

      // Regular employee cannot view detailed receipts of colleagues
      expect(() => {
        announcementService.getAnnouncementReceipts(bohiconReceptionist, ann.id);
      }).toThrow(/Seul l'auteur ou un responsable/);
    });
  });

  // 12. Comportement des adaptateurs de canaux externes
  describe("12. External channel adapters consent check and graceful fallback", () => {
    it("skips unconsented external notification channels without failing internal notification", async () => {
      // Set preferences with email disabled
      notificationService.updateUserPreferences(
        "user-rec-boh",
        "tenant-vignoble-001",
        { emailNotifications: false, smsNotifications: false }
      );

      const notif = await notificationService.dispatchNotification({
        tenantId: "tenant-vignoble-001",
        userId: "user-rec-boh",
        category: "OPERATIONS",
        priority: "HIGH",
        title: "Test externe",
        summary: "Notification interne préservée",
        actionUrl: "/pms/reception",
      });

      expect(notif?.id).toBeDefined();
      expect(notif?.read).toBe(false);

      // In-app notification still received
      const unreadCount = notificationService.getUnreadCount("user-rec-boh");
      expect(unreadCount).toBeGreaterThanOrEqual(1);
    });
  });

  // 13. États vides et d'erreur
  describe("13. Safe empty and error states across all modules", () => {
    it("returns empty arrays and zero counts gracefully for brand new users", () => {
      const emptyNotifs = notificationService.getNotificationsForUser("user-unknown-999", "tenant-vignoble-001");
      expect(emptyNotifs).toEqual([]);

      const unreadCount = notificationService.getUnreadCount("user-unknown-999");
      expect(unreadCount).toBe(0);
    });

    it("returns null or empty for non-existent conversation queries without crashing", () => {
      const nonExistent = messagingService.getConversationById("conv-non-existent-12345");
      expect(nonExistent).toBeNull();
    });

    it("gracefully returns empty list when searching with query having no matches", () => {
      const results = messagingService.listConversationsForUser(
        bohiconReceptionist,
        "xyz_totally_impossible_query_999"
      );
      expect(results).toEqual([]);
    });
  });
});
