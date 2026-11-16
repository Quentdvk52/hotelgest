export type LegalDocumentCategory =
  | "MENTIONS"
  | "CONFIDENTIALITE"
  | "COOKIES"
  | "CGU"
  | "CGV_SEJOUR"
  | "ANNULATION"
  | "RESTAURATION"
  | "LOCATION_VEHICULES"
  | "EVENEMENTS"
  | "TRAITEUR"
  | "RECLAMATIONS"
  | "ACCESSIBILITE";

export type LegalDocumentStatus = "BROUILLON" | "PUBLIE" | "ARCHIVE";

export type LegalScope = "GROUPE" | "BOHICON" | "ABOMEY" | "CALAVI" | "ZOGBODOMEY";

export type LegalLanguage = "FR" | "EN";

export interface LegalDocumentVersion {
  id: string;
  documentId: string;
  versionNumber: string; // e.g. "v1.0", "v1.1", "v2.0"
  status: LegalDocumentStatus;
  content: string; // Markdown formatted legal text
  summaryOfChanges: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  publishedAt?: string;
  incompletePlaceholders: string[]; // e.g. ["[DÉNOMINATION LÉGALE À COMPLÉTER]", ...]
}

export interface LegalDocument {
  id: string;
  slug: string;
  title: string;
  category: LegalDocumentCategory;
  description: string;
  scope: LegalScope;
  language: LegalLanguage;
  isPubliclyVisible: boolean;
  currentPublishedVersionId: string | null;
  versions: LegalDocumentVersion[];
  updatedAt: string;
}

export interface CookieConsentCategory {
  id: "NECESSARY" | "FUNCTIONAL" | "ANALYTICS" | "MARKETING";
  title: string;
  description: string;
  isMandatory: boolean;
  enabled: boolean;
}

export interface CookieConsentSettings {
  version: string;
  bannerTitle: string;
  bannerDescription: string;
  categories: CookieConsentCategory[];
  updatedAt: string;
  updatedBy: string;
}

export interface StoredCookieConsent {
  timestamp: string;
  policyVersion: string;
  categories: {
    NECESSARY: boolean;
    FUNCTIONAL: boolean;
    ANALYTICS: boolean;
    MARKETING: boolean;
  };
}
