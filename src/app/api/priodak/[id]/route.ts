import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id, 10);
    const prioDakId = parseInt(id, 10);

    if (isNaN(prioDakId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await prisma.prioDak.delete({
      where: { id: prioDakId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting prioDak:", error);
    return NextResponse.json(
      { error: "Failed to delete PrioDak" },
      { status: 500 }
    );
  }
}
