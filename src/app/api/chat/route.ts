import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  try {
    // Determine the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run cleanup for messages older than 7 days (fire and forget to not block the request)
    prisma.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    }).catch(e => console.error("Error during background chat cleanup:", e));

    const messages = await prisma.chatMessage.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest first (bottom up in UI)
    });

    // Decrypt content and image urls
    const decryptedMessages = messages.map(msg => ({
      ...msg,
      content: msg.content ? decrypt(msg.content) : null,
      imageUrl: msg.imageUrl ? decrypt(msg.imageUrl) : null,
    }));

    return NextResponse.json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, content, imageUrl } = body;

    if (!userName || typeof userName !== "string") {
      return NextResponse.json({ error: "Invalid userName" }, { status: 400 });
    }

    if ((!content || typeof content !== "string") && !imageUrl) {
      return NextResponse.json({ error: "Message must contain either text or an image" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content ? encrypt(content) : null,
        imageUrl: imageUrl ? encrypt(imageUrl) : null,
        userId: user.id,
      },
      include: {
        user: { select: { name: true } }
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
