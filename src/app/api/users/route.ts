import { NextResponse } from "next/server";
import { asApiError } from "@/lib/documents";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin().from("profiles").select("id,name,email").order("name");
    if (error) throw error;
    return NextResponse.json({ users: data });
  } catch (error) { return NextResponse.json({ error: asApiError(error) }, { status: 500 }); }
}
