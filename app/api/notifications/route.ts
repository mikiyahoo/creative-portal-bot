import { NextRequest, NextResponse } from "next/server";

interface Notification {
  id: string;
  type: "job_match" | "workshop" | "event" | "application";
  title: string;
  description: string;
  link?: string;
  createdAt: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "workshop",
    title: "UI/UX Masterclass",
    description: "Learn advanced prototyping techniques this weekend",
    link: "https://example.com/workshop",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "event",
    title: "Creative Portfolio Review",
    description: "Get your portfolio reviewed by industry experts",
    link: "https://example.com/event",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get("telegramId");

  if (!telegramId) {
    return NextResponse.json(
      { error: "Missing telegramId" },
      { status: 400 }
    );
  }

  return NextResponse.json({ notifications });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, link, telegramId } = body;

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      description,
      link,
      createdAt: new Date().toISOString(),
      read: false,
    };

    notifications.unshift(newNotification);

    return NextResponse.json({ notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, read } = body;

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = read;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}