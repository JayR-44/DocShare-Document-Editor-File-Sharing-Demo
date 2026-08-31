import { NextRequest, NextResponse } from "next/server";
import { asApiError, getDocumentAccess, toDocumentItem } from "@/lib/documents";
import { getSupabaseAdmin } from "@/lib/supabase";
import { contentSchema, titleSchema, userIdSchema } from "@/lib/validation";

type Context = { params: Promise<{ documentId: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const userId = userIdSchema.safeParse(request.nextUrl.searchParams.get("userId"));
  if (!userId.success) return NextResponse.json({ error: "A valid user is required." }, { status: 400 });
  try { const access = await getDocumentAccess((await params).documentId, userId.data); if (!access) return NextResponse.json({ error: "You do not have access to this document." }, { status: 403 }); return NextResponse.json({ document: toDocumentItem(access.document, access.permission) }); }
  catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const body = await request.json(); const userId = userIdSchema.safeParse(body.userId);
  if (!userId.success) return NextResponse.json({ error: "A valid user is required." }, { status: 400 });
  const title = body.title === undefined ? undefined : titleSchema.safeParse(body.title); const content = body.content === undefined ? undefined : contentSchema.safeParse(body.content);
  if ((title && !title.success) || (content && !content.success) || (!title && !content)) return NextResponse.json({ error: "Provide a valid title or document content." }, { status: 400 });
  try {
    const documentId = (await params).documentId; const access = await getDocumentAccess(documentId, userId.data);
    if (!access || access.permission === "viewer") return NextResponse.json({ error: "You do not have edit access to this document." }, { status: 403 });
    const update: Record<string, unknown> = {}; if (title?.success) update.title = title.data; if (content?.success) update.content = content.data;
    const { data, error } = await getSupabaseAdmin().from("documents").update(update).eq("id", documentId).select("id,title,content,owner_id,created_at,updated_at,profiles!documents_owner_id_fkey(name)").single();
    if (error) throw error; return NextResponse.json({ document: toDocumentItem(data, access.permission) });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const body = await request.json();
  const userId = userIdSchema.safeParse(body.userId);
  if (!userId.success) return NextResponse.json({ error: "A valid user is required." }, { status: 400 });
  try {
    const documentId = (await params).documentId;
    const access = await getDocumentAccess(documentId, userId.data);
    if (!access || access.permission !== "owner") return NextResponse.json({ error: "Only the owner can delete a document." }, { status: 403 });
    const { error } = await getSupabaseAdmin().from("documents").delete().eq("id", documentId);
    if (error) throw error;
    return NextResponse.json({ deletedId: documentId });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}
