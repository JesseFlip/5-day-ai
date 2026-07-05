import { NextResponse } from "next/server";
import { MODULES } from "@/lib/content/curriculum";

export async function GET() {
  return NextResponse.json({ modules: MODULES });
}
