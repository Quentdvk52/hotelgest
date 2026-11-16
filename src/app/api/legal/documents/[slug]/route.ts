import { NextRequest, NextResponse } from "next/server";
import {
  getLegalDocumentBySlug,
  isAuthorizedToManageLegal,
} from "@/modules/legal/legal-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("drafts") === "true";

  if (includeDrafts) {
    const role = request.headers.get("x-user-role");
    if (!isAuthorizedToManageLegal(role)) {
      return NextResponse.json(
        { error: "Accès refusé aux versions de travail." },
        { status: 403 }
      );
    }
  }

  const result = getLegalDocumentBySlug(slug, includeDrafts);
  if (!result) {
    return NextResponse.json(
      { error: "Document légal introuvable ou non publié." },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
