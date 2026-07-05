import { NextResponse } from "next/server";
// Implemented by MCP agent
export async function POST() {
  return NextResponse.json({ jsonrpc: "2.0", error: { code: -32000, message: "Not implemented" }, id: null });
}
