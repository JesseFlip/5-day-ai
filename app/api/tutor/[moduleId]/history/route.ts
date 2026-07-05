import { NextResponse } from "next/server";
// Implemented by tutor agent
export async function GET() {
  return NextResponse.json({ messages: [] });
}
export async function DELETE() {
  return NextResponse.json({ ok: true });
}
