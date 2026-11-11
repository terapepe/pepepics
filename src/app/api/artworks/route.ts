import { NextResponse } from "next/server";
import { queryArtworks } from "@/lib/data";
import { parseArtworkQuery } from "@/lib/query";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = parseArtworkQuery(sp);
  if (q.ids) q.pageSize = 60;
  const page = await queryArtworks(q);
  return NextResponse.json(page);
}
