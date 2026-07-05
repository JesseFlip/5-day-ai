import { NextResponse } from "next/server";
// Implemented by content agent
export async function GET() {
  return NextResponse.json({ modules: [] });
}
