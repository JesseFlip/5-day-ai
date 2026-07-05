import { NextResponse } from "next/server";
import { getModuleById, getStepsForModule } from "@/lib/content/curriculum";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const moduleId = parseInt(id, 10);

  if (isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id" }, { status: 400 });
  }

  const mod = getModuleById(moduleId);
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const steps = getStepsForModule(moduleId);
  return NextResponse.json({ module: mod, steps });
}
