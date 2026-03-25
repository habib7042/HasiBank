import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userNameStr = searchParams.get("userName");

    if (!userNameStr) {
      return NextResponse.json(
        { error: "userName is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { name: userNameStr },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prioDaks = await prisma.prioDak.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prioDaks);
  } catch (error) {
    console.error("Error fetching prioDaks:", error);
    return NextResponse.json(
      { error: "Failed to fetch PrioDaks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, userName } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    if (!userName || typeof userName !== "string") {
      return NextResponse.json({ error: "Invalid userName" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prioDak = await prisma.prioDak.create({
      data: {
        name,
        userId: user.id,
      },
    });

    return NextResponse.json(prioDak, { status: 201 });
  } catch (error) {
    console.error("Error creating prioDak:", error);
    return NextResponse.json(
      { error: "Failed to create PrioDak" },
      { status: 500 }
    );
  }
}
