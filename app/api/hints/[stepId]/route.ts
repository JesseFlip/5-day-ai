import { NextResponse } from "next/server";
// Implemented by hints agent
export async function GET() {
  return NextResponse.json({ revealed: [] });
}
