import { NextRequest, NextResponse } from "next/server";
import { markdownToDocument } from "@/lib/document-content";
import { asApiError, toDocumentItem } from "@/lib/documents";
import { getSupabaseAdmin } from "@/lib/supabase";
import { userIdSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json(); const userId = userIdSchema.safeParse(body.userId);
  const fileName = typeof body.fileName === "string" ? body.fileName : ""; const rawText = typeof body.rawText === "string" ? body.rawText : "";
  if (!userId.success || !/\.(txt|md)$/i.test(fileName) || rawText.length > 200_000) return NextResponse.json({ error: "Use a .txt or .md file smaller than 200 KB." }, { status: 400 });
  try {
    const title = fileName.replace(/\.(txt|md)$/i, "").trim() || "Imported document";
    const { data, error } = await getSupabaseAdmin().from("documents").insert({ owner_id: userId.data, title: title.slice(0, 120), content: markdownToDocument(rawText) }).select("id,title,content,owner_id,created_at,updated_at,profiles!documents_owner_id_fkey(name)").single();
    if (error) throw error; return NextResponse.json({ document: toDocumentItem(data, "owner") }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}
