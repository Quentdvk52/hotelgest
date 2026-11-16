import { NextRequest, NextResponse } from "next/server";
import {
  getAllLegalDocuments,
  saveDraftVersion,
  updateDocumentMetadata,
  isAuthorizedToManageLegal,
} from "@/modules/legal/legal-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("drafts") === "true";

  // If requesting drafts, check authorization header or cookie
  if (includeDrafts) {
    const role = request.headers.get("x-user-role");
    if (!isAuthorizedToManageLegal(role)) {
      return NextResponse.json(
        { error: "Accès refusé aux versions préliminaires et brouillons." },
        { status: 403 }
      );
    }
  }

  const docs = getAllLegalDocuments(includeDrafts);
  return NextResponse.json({ documents: docs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, content, summaryOfChanges, author, updates } = body;

    const role = author?.roleCode || request.headers.get("x-user-role");
    if (!isAuthorizedToManageLegal(role)) {
      return NextResponse.json(
        { error: "Privilège insuffisant : Seuls le Promoteur et le DAF peuvent modifier les documents légaux." },
        { status: 403 }
      );
    }

    if (updates) {
      const metaRes = updateDocumentMetadata(documentId, updates, { roleCode: role });
      if (!metaRes.success) {
        return NextResponse.json({ error: metaRes.error }, { status: 400 });
      }
    }

    if (content !== undefined) {
      const res = saveDraftVersion(documentId, content, summaryOfChanges, {
        id: author?.id || "user-promoter-01",
        name: author?.name || "Direction Générale (Promoteur)",
        roleCode: role,
      });

      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, version: res.version });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du brouillon : " + err.message },
      { status: 500 }
    );
  }
}
