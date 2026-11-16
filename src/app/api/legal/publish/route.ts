import { NextRequest, NextResponse } from "next/server";
import {
  publishVersion,
  restoreVersionAsDraft,
  isAuthorizedToManageLegal,
} from "@/modules/legal/legal-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, documentId, versionId, user } = body;

    const role = user?.roleCode || request.headers.get("x-user-role");
    if (!isAuthorizedToManageLegal(role)) {
      return NextResponse.json(
        { error: "Privilège insuffisant : Seuls le Promoteur et le DAF peuvent publier ou restaurer des documents légaux." },
        { status: 403 }
      );
    }

    if (action === "restore") {
      const res = restoreVersionAsDraft(documentId, versionId, {
        id: user?.id || "user-promoter-01",
        name: user?.name || "Direction Générale",
        roleCode: role,
      });

      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, newDraft: res.newDraft });
    }

    // Default action: publish
    const res = publishVersion(documentId, versionId, {
      id: user?.id || "user-promoter-01",
      name: user?.name || "Direction Générale (Promoteur)",
      roleCode: role,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      publishedVersion: res.publishedVersion,
      remainingPlaceholders: res.remainingPlaceholders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la publication : " + err.message },
      { status: 500 }
    );
  }
}
