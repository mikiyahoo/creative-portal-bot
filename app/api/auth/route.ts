import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

const usersDb = new Map<number, { role: string; registeredAt: string }>();

function verifyTelegramInitData(
  initData: string,
  botToken: string
): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    
    if (!hash) return null;
    
    params.delete("hash");
    
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();
    
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");
    
    if (calculatedHash !== hash) return null;
    
    const userParam = params.get("user");
    if (!userParam) return null;
    
    return JSON.parse(userParam) as TelegramUser;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;
    
    if (!initData) {
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 400 }
      );
    }
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const user = verifyTelegramInitData(initData, botToken);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }
    
    const existingUser = usersDb.get(user.id);
    const role = existingUser?.role || null;
    
    return NextResponse.json({ user, role });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const telegramId = searchParams.get("telegramId");
  
  if (!telegramId) {
    return NextResponse.json(
      { error: "Missing telegramId" },
      { status: 400 }
    );
  }
  
  const id = parseInt(telegramId, 10);
  const userData = usersDb.get(id);
  
  if (userData) {
    return NextResponse.json({ 
      role: userData.role,
      registered: true 
    });
  }
  
  return NextResponse.json({ 
    role: null,
    registered: false 
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, role } = body;
    
    if (!telegramId || !role) {
      return NextResponse.json(
        { error: "Missing telegramId or role" },
        { status: 400 }
      );
    }
    
    usersDb.set(telegramId, {
      role,
      registeredAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}