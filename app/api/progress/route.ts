import { NextResponse } from "next/server";
// Implemented by progress agent
export async function GET() {
  return NextResponse.json({ completedStepIds: [], streak: 0, nextStepId: null });
}
export async function POST() {
  return NextResponse.json({ ok: true, nextStepId: null });
}
