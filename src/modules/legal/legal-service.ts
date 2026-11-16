import {
  LegalDocument,
  LegalDocumentVersion,
  CookieConsentSettings,
} from "./types";
import {
  INITIAL_LEGAL_DOCUMENTS,
  DEFAULT_COOKIE_SETTINGS,
  findPlaceholders,
} from "./default-documents";

let documentsStore: LegalDocument[] = JSON.parse(
  JSON.stringify(INITIAL_LEGAL_DOCUMENTS)
);
let cookieSettingsStore: CookieConsentSettings = JSON.parse(
  JSON.stringify(DEFAULT_COOKIE_SETTINGS)
);

export function isAuthorizedToManageLegal(roleCode?: string | null): boolean {
  if (!roleCode) return false;
  return roleCode === "PROMOTER" || roleCode === "FINANCIAL_DIRECTOR";
}

export function getAllLegalDocuments(includeDrafts = false): LegalDocument[] {
  if (includeDrafts) {
    return documentsStore;
  }
  // Public visitors: only return documents that are publicly visible and have a published version
  return documentsStore
    .filter((doc) => doc.isPubliclyVisible && doc.currentPublishedVersionId)
    .map((doc) => {
      const pubVersion = doc.versions.find(
        (v) => v.id === doc.currentPublishedVersionId && v.status === "PUBLIE"
      );
      return {
        ...doc,
        versions: pubVersion ? [pubVersion] : [],
      };
    })
    .filter((doc) => doc.versions.length > 0);
}

export function getLegalDocumentBySlug(
  slug: string,
  includeDrafts = false
): { document: LegalDocument; publishedVersion: LegalDocumentVersion | null; draftVersion: LegalDocumentVersion | null } | null {
  const doc = documentsStore.find((d) => d.slug === slug);
  if (!doc) return null;

  const publishedVersion = doc.currentPublishedVersionId
    ? doc.versions.find((v) => v.id === doc.currentPublishedVersionId && v.status === "PUBLIE") || null
    : null;

  // If public visitor and document is hidden or not published, return null
  if (!includeDrafts && (!doc.isPubliclyVisible || !publishedVersion)) {
    return null;
  }

  const draftVersion =
    doc.versions.find((v) => v.status === "BROUILLON") || null;

  return {
    document: includeDrafts
      ? doc
      : {
          ...doc,
          versions: publishedVersion ? [publishedVersion] : [],
        },
    publishedVersion,
    draftVersion,
  };
}

export function saveDraftVersion(
  documentId: string,
  content: string,
  summaryOfChanges: string,
  author: { id: string; name: string; roleCode: string }
): { success: boolean; version?: LegalDocumentVersion; error?: string } {
  if (!isAuthorizedToManageLegal(author.roleCode)) {
    return { success: false, error: "Privilège insuffisant : Seuls le Promoteur et le DAF peuvent modifier les documents légaux." };
  }

  const doc = documentsStore.find((d) => d.id === documentId);
  if (!doc) return { success: false, error: "Document introuvable." };

  const placeholders = findPlaceholders(content);
  const now = new Date().toISOString();

  // Find existing draft or create new
  let draft = doc.versions.find((v) => v.status === "BROUILLON");
  if (draft) {
    draft.content = content;
    draft.summaryOfChanges = summaryOfChanges || draft.summaryOfChanges;
    draft.authorId = author.id;
    draft.authorName = author.name;
    draft.incompletePlaceholders = placeholders;
    draft.createdAt = now;
  } else {
    const nextVerIndex = doc.versions.length + 1;
    draft = {
      id: `ver-${doc.slug}-v${nextVerIndex}-${Date.now().toString().slice(-4)}`,
      documentId: doc.id,
      versionNumber: `v${Math.floor(nextVerIndex / 2) + 1}.${nextVerIndex % 2}`,
      status: "BROUILLON",
      content,
      summaryOfChanges: summaryOfChanges || "Modifications en cours de rédaction",
      authorId: author.id,
      authorName: author.name,
      createdAt: now,
      incompletePlaceholders: placeholders,
    };
    doc.versions.unshift(draft);
  }

  doc.updatedAt = now;
  return { success: true, version: draft };
}

export function publishVersion(
  documentId: string,
  versionId: string,
  user: { id: string; name: string; roleCode: string }
): { success: boolean; publishedVersion?: LegalDocumentVersion; remainingPlaceholders?: string[]; error?: string } {
  if (!isAuthorizedToManageLegal(user.roleCode)) {
    return { success: false, error: "Privilège insuffisant : Seuls le Promoteur et le DAF peuvent publier des documents légaux." };
  }

  const doc = documentsStore.find((d) => d.id === documentId);
  if (!doc) return { success: false, error: "Document introuvable." };

  const targetVersion = doc.versions.find((v) => v.id === versionId);
  if (!targetVersion) return { success: false, error: "Version introuvable." };

  const now = new Date().toISOString();

  // Archive previously published version
  for (const v of doc.versions) {
    if (v.status === "PUBLIE") {
      v.status = "ARCHIVE";
    }
  }

  targetVersion.status = "PUBLIE";
  targetVersion.publishedAt = now;
  targetVersion.authorId = user.id;
  targetVersion.authorName = user.name;
  targetVersion.incompletePlaceholders = findPlaceholders(targetVersion.content);

  doc.currentPublishedVersionId = targetVersion.id;
  doc.updatedAt = now;

  return {
    success: true,
    publishedVersion: targetVersion,
    remainingPlaceholders: targetVersion.incompletePlaceholders,
  };
}

export function restoreVersionAsDraft(
  documentId: string,
  sourceVersionId: string,
  user: { id: string; name: string; roleCode: string }
): { success: boolean; newDraft?: LegalDocumentVersion; error?: string } {
  if (!isAuthorizedToManageLegal(user.roleCode)) {
    return { success: false, error: "Privilège insuffisant pour restaurer une version." };
  }

  const doc = documentsStore.find((d) => d.id === documentId);
  if (!doc) return { success: false, error: "Document introuvable." };

  const sourceVer = doc.versions.find((v) => v.id === sourceVersionId);
  if (!sourceVer) return { success: false, error: "Version source introuvable." };

  const now = new Date().toISOString();
  const nextVerIndex = doc.versions.length + 1;

  const newDraft: LegalDocumentVersion = {
    id: `ver-${doc.slug}-restored-${Date.now().toString().slice(-4)}`,
    documentId: doc.id,
    versionNumber: `v${Math.floor(nextVerIndex / 2) + 1}.0-restauree`,
    status: "BROUILLON",
    content: sourceVer.content,
    summaryOfChanges: `Restauré à partir de la version ${sourceVer.versionNumber}`,
    authorId: user.id,
    authorName: user.name,
    createdAt: now,
    incompletePlaceholders: findPlaceholders(sourceVer.content),
  };

  doc.versions.unshift(newDraft);
  doc.updatedAt = now;

  return { success: true, newDraft };
}

export function updateDocumentMetadata(
  documentId: string,
  updates: { isPubliclyVisible?: boolean; scope?: any; language?: any },
  user: { roleCode: string }
): { success: boolean; error?: string } {
  if (!isAuthorizedToManageLegal(user.roleCode)) {
    return { success: false, error: "Privilège insuffisant." };
  }

  const doc = documentsStore.find((d) => d.id === documentId);
  if (!doc) return { success: false, error: "Document introuvable." };

  if (typeof updates.isPubliclyVisible === "boolean") {
    doc.isPubliclyVisible = updates.isPubliclyVisible;
  }
  if (updates.scope) doc.scope = updates.scope;
  if (updates.language) doc.language = updates.language;
  doc.updatedAt = new Date().toISOString();

  return { success: true };
}

export function getCookieSettings(): CookieConsentSettings {
  return cookieSettingsStore;
}

export function updateCookieSettings(
  updates: Partial<CookieConsentSettings>,
  user: { name: string; roleCode: string }
): { success: boolean; settings?: CookieConsentSettings; error?: string } {
  if (!isAuthorizedToManageLegal(user.roleCode)) {
    return { success: false, error: "Privilège insuffisant pour modifier les réglages de cookies." };
  }

  cookieSettingsStore = {
    ...cookieSettingsStore,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: user.name,
  };

  return { success: true, settings: cookieSettingsStore };
}

export function diffLines(oldText: string, newText: string): { type: "same" | "add" | "remove"; line: string }[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: { type: "same" | "add" | "remove"; line: string }[] = [];

  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    const o = oldLines[i];
    const n = newLines[i];
    if (o === n) {
      if (o !== undefined) result.push({ type: "same", line: o });
    } else {
      if (o !== undefined) result.push({ type: "remove", line: o });
      if (n !== undefined) result.push({ type: "add", line: n });
    }
  }

  return result;
}

export function _resetStoreForTesting(): void {
  documentsStore = JSON.parse(JSON.stringify(INITIAL_LEGAL_DOCUMENTS));
  cookieSettingsStore = JSON.parse(JSON.stringify(DEFAULT_COOKIE_SETTINGS));
}
