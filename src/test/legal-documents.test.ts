import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllLegalDocuments,
  getLegalDocumentBySlug,
  saveDraftVersion,
  publishVersion,
  restoreVersionAsDraft,
  updateDocumentMetadata,
  getCookieSettings,
  updateCookieSettings,
  isAuthorizedToManageLegal,
  diffLines,
  _resetStoreForTesting,
} from "../modules/legal/legal-service";
import { findPlaceholders } from "../modules/legal/default-documents";

describe("Legal Documents System & Compliance", () => {
  const mockAdmin = {
    id: "usr-admin-001",
    name: "Eddy GNACADJA",
    roleCode: "PROMOTER",
  };

  const mockUnauthorized = {
    id: "usr-staff-002",
    name: "Gaston (Serveur)",
    roleCode: "WAITSTAFF",
  };

  beforeEach(() => {
    _resetStoreForTesting();
  });

  describe("Initial Seed Documents & Placeholders", () => {
    it("should initialize exactly 12 mandatory legal documents in French", () => {
      const docs = getAllLegalDocuments(true);
      expect(docs.length).toBe(12);

      const slugs = docs.map((d) => d.slug);
      expect(slugs).toContain("mentions-legales");
      expect(slugs).toContain("politique-confidentialite");
      expect(slugs).toContain("cookies-et-traceurs");
      expect(slugs).toContain("cgu");
      expect(slugs).toContain("conditions-generales-sejour");
      expect(slugs).toContain("annulation-et-remboursement");
      expect(slugs).toContain("vente-restaurant-room-service");
      expect(slugs).toContain("location-vehicules");
      expect(slugs).toContain("location-salles-et-evenements");
      expect(slugs).toContain("service-traiteur-et-materiel");
      expect(slugs).toContain("reclamations-et-contact");
      expect(slugs).toContain("declaration-accessibilite");
    });

    it("should all be in French language with default PUBLIE version", () => {
      const docs = getAllLegalDocuments(true);
      for (const doc of docs) {
        expect(doc.language).toBe("FR");
        expect(doc.versions.length).toBeGreaterThanOrEqual(1);
        const published = doc.versions.find((v) => v.status === "PUBLIE");
        expect(published).toBeDefined();
        expect(published?.content.length).toBeGreaterThan(100);
      }
    });

    it("should correctly detect explicit bracketed placeholders", () => {
      const sampleText = `
        La société [DÉNOMINATION LÉGALE À COMPLÉTER], au capital de [MONTANT DU CAPITAL À COMPLÉTER],
        immatriculée sous le RCCM [NUMÉRO D'IMMATRICULATION RCCM À COMPLÉTER].
        Texte normal sans crochets.
      `;
      const detected = findPlaceholders(sampleText);
      expect(detected).toEqual([
        "[DÉNOMINATION LÉGALE À COMPLÉTER]",
        "[MONTANT DU CAPITAL À COMPLÉTER]",
        "[NUMÉRO D'IMMATRICULATION RCCM À COMPLÉTER]",
      ]);
    });

    it("should return empty array if text has no bracketed placeholders", () => {
      const cleanText = "Ceci est un document juridique parfaitement renseigné et sans variable.";
      expect(findPlaceholders(cleanText)).toEqual([]);
    });
  });

  describe("Public vs Private Isolation", () => {
    it("should retrieve a published document by slug for public visitors", () => {
      const res = getLegalDocumentBySlug("mentions-legales", false);
      expect(res).toBeDefined();
      expect(res?.document.slug).toBe("mentions-legales");
      expect(res?.publishedVersion).toBeDefined();
    });

    it("should return null for public visitors if document is hidden", () => {
      const res = getLegalDocumentBySlug("mentions-legales", true);
      expect(res).toBeDefined();
      const docId = res!.document.id;

      // Hide document
      updateDocumentMetadata(docId, { isPubliclyVisible: false }, { roleCode: "PROMOTER" });

      // Public visitor (includeDrafts=false) cannot see it
      const hiddenPublic = getLegalDocumentBySlug("mentions-legales", false);
      expect(hiddenPublic).toBeNull();

      // Admin (includeDrafts=true) can still see it
      const adminDoc = getLegalDocumentBySlug("mentions-legales", true);
      expect(adminDoc).toBeDefined();
      expect(adminDoc?.document.isPubliclyVisible).toBe(false);
    });

    it("should return null for non-existent slug", () => {
      const notFound = getLegalDocumentBySlug("unknown-slug-xyz", false);
      expect(notFound).toBeNull();
    });
  });

  describe("Draft vs Published Lifecycle & Versioning", () => {
    it("should save draft without altering currently published content", () => {
      const res = getLegalDocumentBySlug("cgu", true)!;
      const initialPublished = res.publishedVersion!;
      const originalContent = initialPublished.content;

      // Save a new draft
      const draftText = "# CGU Modifiées\n\nNouveau paragraphe de test pour le brouillon.";
      const saveRes = saveDraftVersion(
        res.document.id,
        draftText,
        "Mise à jour conditions d'utilisation",
        mockAdmin
      );
      expect(saveRes.success).toBe(true);
      expect(saveRes.version).toBeDefined();
      expect(saveRes.version?.status).toBe("BROUILLON");
      expect(saveRes.version?.content).toBe(draftText);

      // Verify published version in store remains intact
      const refreshed = getLegalDocumentBySlug("cgu", true)!;
      expect(refreshed.publishedVersion?.content).toBe(originalContent);
      expect(refreshed.publishedVersion?.content).not.toBe(draftText);
      expect(refreshed.draftVersion?.content).toBe(draftText);
    });

    it("should reject saveDraft if user lacks promoter/daf permissions", () => {
      const res = getLegalDocumentBySlug("cgu", true)!;
      const saveRes = saveDraftVersion(
        res.document.id,
        "Tentative par serveur",
        "Piratage",
        mockUnauthorized
      );
      expect(saveRes.success).toBe(false);
      expect(saveRes.error).toContain("Privilège insuffisant");
    });

    it("should publish a draft version, archive the old published version and update timestamp", () => {
      const res = getLegalDocumentBySlug("cookies-et-traceurs", true)!;
      const oldPublishedId = res.publishedVersion!.id;

      // 1. Create a draft
      const newDraftContent = "# Politique relative aux cookies v2\n\nNouvelle politique détaillée.";
      const saveRes = saveDraftVersion(
        res.document.id,
        newDraftContent,
        "Refonte RGPD cookies",
        mockAdmin
      );
      const draftId = saveRes.version!.id;

      // 2. Publish draft
      const pubRes = publishVersion(res.document.id, draftId, mockAdmin);
      expect(pubRes.success).toBe(true);
      expect(pubRes.publishedVersion).toBeDefined();
      expect(pubRes.publishedVersion?.status).toBe("PUBLIE");
      expect(pubRes.publishedVersion?.content).toBe(newDraftContent);

      // Verify refreshed state
      const refreshed = getLegalDocumentBySlug("cookies-et-traceurs", true)!;
      expect(refreshed.publishedVersion?.id).toBe(draftId);

      // Previous version is now ARCHIVE
      const previousVersion = refreshed.document.versions.find((v) => v.id === oldPublishedId);
      expect(previousVersion?.status).toBe("ARCHIVE");

      // Only one version is PUBLIE
      const allPublished = refreshed.document.versions.filter((v) => v.status === "PUBLIE");
      expect(allPublished.length).toBe(1);
    });

    it("should restore an archived version as a new draft without modifying current published version", () => {
      const res = getLegalDocumentBySlug("mentions-legales", true)!;
      const v1Id = res.publishedVersion!.id;
      const v1Content = res.publishedVersion!.content;

      // Create draft 2, publish it, making v1 ARCHIVE
      const saveRes = saveDraftVersion(res.document.id, "Contenu Version 2", "Passage v2", mockAdmin);
      publishVersion(res.document.id, saveRes.version!.id, mockAdmin);

      const afterV2 = getLegalDocumentBySlug("mentions-legales", true)!;
      expect(afterV2.publishedVersion?.content).toBe("Contenu Version 2");

      // Restore v1 as draft
      const restoreRes = restoreVersionAsDraft(res.document.id, v1Id, mockAdmin);
      expect(restoreRes.success).toBe(true);
      expect(restoreRes.newDraft?.status).toBe("BROUILLON");
      expect(restoreRes.newDraft?.content).toBe(v1Content);

      // Published version still remains Version 2
      const afterRestore = getLegalDocumentBySlug("mentions-legales", true)!;
      expect(afterRestore.publishedVersion?.content).toBe("Contenu Version 2");
      expect(afterRestore.draftVersion?.content).toBe(v1Content);
    });
  });

  describe("Diff Calculation Tool", () => {
    it("should compute line-by-line differences between two versions", () => {
      const oldText = "Ligne 1\nLigne 2\nLigne 3";
      const newText = "Ligne 1\nLigne 2 modifiée\nLigne 3\nLigne 4 ajoutée";

      const diff = diffLines(oldText, newText);
      expect(diff.length).toBeGreaterThan(0);

      const adds = diff.filter((d) => d.type === "add");
      const removes = diff.filter((d) => d.type === "remove");

      expect(adds.length).toBeGreaterThan(0);
      expect(removes.length).toBeGreaterThan(0);
      expect(adds.some((d) => d.line.includes("Ligne 4 ajoutée"))).toBe(true);
    });
  });

  describe("RBAC Access Permissions for Legal Documents", () => {
    it("should allow PROMOTER and FINANCIAL_DIRECTOR", () => {
      expect(isAuthorizedToManageLegal("PROMOTER")).toBe(true);
      expect(isAuthorizedToManageLegal("FINANCIAL_DIRECTOR")).toBe(true);
    });

    it("should forbid other roles and unauthorized visitors", () => {
      expect(isAuthorizedToManageLegal("PROPERTY_MANAGER")).toBe(false);
      expect(isAuthorizedToManageLegal("RECEPTIONIST")).toBe(false);
      expect(isAuthorizedToManageLegal("WAITSTAFF")).toBe(false);
      expect(isAuthorizedToManageLegal("BARTENDER")).toBe(false);
      expect(isAuthorizedToManageLegal("CHEF")).toBe(false);
      expect(isAuthorizedToManageLegal("HOUSEKEEPING")).toBe(false);
      expect(isAuthorizedToManageLegal(null)).toBe(false);
      expect(isAuthorizedToManageLegal(undefined)).toBe(false);
    });
  });

  describe("Cookie Preferences & Consent Configuration", () => {
    it("should retrieve default cookie configuration with required and optional categories", () => {
      const settings = getCookieSettings();
      expect(settings).toBeDefined();
      expect(settings.categories.length).toBe(4);

      const necessary = settings.categories.find((c) => c.id === "NECESSARY")!;
      expect(necessary.isMandatory).toBe(true);
      expect(necessary.enabled).toBe(true);

      const analytics = settings.categories.find((c) => c.id === "ANALYTICS")!;
      expect(analytics.isMandatory).toBe(false);
      expect(analytics.enabled).toBe(false);
    });

    it("should update cookie settings and banner texts", () => {
      const res = updateCookieSettings(
        {
          bannerDescription: "Nouveau texte de consentement légal pour Le Vignoble.",
        },
        mockAdmin
      );

      expect(res.success).toBe(true);
      expect(res.settings?.bannerDescription).toBe("Nouveau texte de consentement légal pour Le Vignoble.");

      const fetched = getCookieSettings();
      expect(fetched.bannerDescription).toBe("Nouveau texte de consentement légal pour Le Vignoble.");
    });
  });
});
