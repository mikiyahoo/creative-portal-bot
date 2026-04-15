import { NextRequest, NextResponse } from "next/server";

interface Portfolio {
  id: string;
  fullName: string;
  bio: string;
  skills: string[];
  portfolioLink?: string;
  telegramId: number;
  createdAt: string;
}

const portfolios: Portfolio[] = [];

export async function GET() {
  return NextResponse.json({ portfolios });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, bio, skills, portfolioLink, telegramId } = body;

    if (!fullName || !bio || !skills || !telegramId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingIndex = portfolios.findIndex((p) => p.telegramId === telegramId);

    const newPortfolio: Portfolio = {
      id: existingIndex >= 0 ? portfolios[existingIndex].id : Date.now().toString(),
      fullName,
      bio,
      skills,
      portfolioLink: portfolioLink || "",
      telegramId,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      portfolios[existingIndex] = newPortfolio;
    } else {
      portfolios.push(newPortfolio);
    }

    return NextResponse.json({ portfolio: newPortfolio }, { status: 201 });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}