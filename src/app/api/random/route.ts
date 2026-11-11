import { NextResponse } from "next/server";
import { getRandomSlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ slug: await getRandomSlug() }, { headers: { "Cache-Control": "no-store" } });
}
