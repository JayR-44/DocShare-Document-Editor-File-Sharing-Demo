import { NextRequest, NextResponse } from "next/server";
import { asApiError, toDocumentItem } from "@/lib/documents";
import { getSupabaseAdmin } from "@/lib/supabase";
import { contentSchema, titleSchema, userIdSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const parsedUserId = userIdSchema.safeParse(userId);
  if (!parsedUserId.success) return NextResponse.json({ error: "A valid user is required." }, { status: 400 });
  try {
    const supabase = getSupabaseAdmin();
    const select = "id,title,content,owner_id,created_at,updated_at,profiles!documents_owner_id_fkey(name)";
    const [{ data: owned, error: ownedError }, { data: shared, error: sharedError }] = await Promise.all([
      supabase.from("documents").select(select).eq("owner_id", parsedUserId.data).order("updated_at", { ascending: false }),
      supabase.from("document_shares").select(`permission, documents(${select})`).eq("user_id", parsedUserId.data),
    ]);
    if (ownedError) throw ownedError; if (sharedError) throw sharedError;
    const documents = [
      ...(owned ?? []).map((document) => toDocumentItem(document, "owner")),
      ...(shared ?? []).flatMap((share) => {
        if (!share.documents) return [];
        const sharedDocuments = Array.isArray(share.documents) ? share.documents : [share.documents];
        return sharedDocuments.map((document) => toDocumentItem(document, share.permission as "viewer" | "editor"));
      }),
    ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({ documents });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = userIdSchema.safeParse(body.userId); const title = titleSchema.safeParse(body.title); const content = contentSchema.safeParse(body.content);
  if (!userId.success || !title.success || !content.success) return NextResponse.json({ error: "Enter a valid title and document content." }, { status: 400 });
  try {
    const { data, error } = await getSupabaseAdmin().from("documents").insert({ owner_id: userId.data, title: title.data, content: content.data }).select("id,title,content,owner_id,created_at,updated_at,profiles!documents_owner_id_fkey(name)").single();
    if (error) throw error;
    return NextResponse.json({ document: toDocumentItem(data, "owner") }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}
