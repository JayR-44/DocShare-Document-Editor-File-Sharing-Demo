import { NextRequest, NextResponse } from "next/server";
import { asApiError, getDocumentAccess } from "@/lib/documents";
import { getSupabaseAdmin } from "@/lib/supabase";
import { permissionSchema, userIdSchema } from "@/lib/validation";

type Context = { params: Promise<{ documentId: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const userId = userIdSchema.safeParse(request.nextUrl.searchParams.get("userId"));
  if (!userId.success) return NextResponse.json({ error: "A valid user is required." }, { status: 400 });
  try {
    const documentId = (await params).documentId; const access = await getDocumentAccess(documentId, userId.data);
    if (!access || access.permission !== "owner") return NextResponse.json({ error: "Only the owner can view sharing settings." }, { status: 403 });
    const { data, error } = await getSupabaseAdmin().from("document_shares").select("user_id,permission,profiles!document_shares_user_id_fkey(name,email)").eq("document_id", documentId);
    if (error) throw error; return NextResponse.json({ shares: data });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: Context) {
  const body = await request.json(); const userId = userIdSchema.safeParse(body.userId); const targetUserId = userIdSchema.safeParse(body.targetUserId); const permission = permissionSchema.safeParse(body.permission);
  if (!userId.success || !targetUserId.success || !permission.success) return NextResponse.json({ error: "Select a valid teammate and permission." }, { status: 400 });
  try {
    const documentId = (await params).documentId; const access = await getDocumentAccess(documentId, userId.data);
    if (!access || access.permission !== "owner") return NextResponse.json({ error: "Only the owner can share a document." }, { status: 403 });
    if (userId.data === targetUserId.data) return NextResponse.json({ error: "The owner already has access." }, { status: 400 });
    const { data: user, error: userError } = await getSupabaseAdmin().from("profiles").select("id").eq("id", targetUserId.data).maybeSingle();
    if (userError) throw userError; if (!user) return NextResponse.json({ error: "That teammate does not exist." }, { status: 404 });
    const { data, error } = await getSupabaseAdmin().from("document_shares").upsert({ document_id: documentId, user_id: targetUserId.data, permission: permission.data }, { onConflict: "document_id,user_id" }).select("document_id,user_id,permission").single();
    if (error) throw error; return NextResponse.json({ share: data }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}
