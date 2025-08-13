import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { memberId } = await params;
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!serverId) {
      console.error("Server ID missing or invalid.");
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!memberId) {
      console.error("Member ID missing");
      return new NextResponse("Member ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return new NextResponse(JSON.stringify(server));
  } catch (error) {
    console.error("[MEMBER_ID_PATCH] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();
    const { memberId } = await params;

    const serverId = searchParams.get("serverId");

    if (!profile) {
      console.error("Profile not found or user not authenticated.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      console.error("Server ID missing or invalid.");
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!memberId) {
      console.error("Member ID missing");
      return new NextResponse("Member ID missing", { status: 400 });
    }

    const updatedServer = await db.server.update({
      where: { id: serverId, profileId: profile.id },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: { role },
          },
        },
      },
      include: {
        members: {
          include: { profile: true },
          orderBy: { role: "asc" },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[MEMBER_ID_PATCH] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
