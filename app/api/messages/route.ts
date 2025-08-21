import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const MESSAGES_BATCH = 10;

type MessageWithMember = Prisma.MessageGetPayload<{
  include: { member: { include: { profile: true } } };
}>;

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
    }

    let messages: MessageWithMember[] = [];

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: { id: cursor },
        where: { channelId },
        include: { member: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: { channelId },
        include: { member: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    const nextCursor =
      messages.length === MESSAGES_BATCH
        ? messages[messages.length - 1].id
        : null;

    return NextResponse.json({ items: messages, nextCursor });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
