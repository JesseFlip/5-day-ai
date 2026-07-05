import { NextResponse } from "next/server";
// Implemented by content agent
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await params;
  return NextResponse.json({ module: null, steps: [] });
}
