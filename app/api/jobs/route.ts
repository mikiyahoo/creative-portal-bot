import { NextRequest, NextResponse } from "next/server";

const jobs: Array<{
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
}> = [
  {
    id: "1",
    title: "Logo Design for Tech Startup",
    budget: "$500 - $800",
    description: "Looking for a creative designer to create a modern, minimalist logo for our AI-powered productivity app. Must have experience with tech/SaaS brands.",
    deadline: "2026-04-30",
    employerName: "TechFlow",
  },
  {
    id: "2",
    title: "UI/UX Redesign for Mobile App",
    budget: "$2000 - $3000",
    description: "We need a complete UI/UX overhaul for our fitness tracking mobile app. Deliverables include wireframes, high-fidelity mockups, and a design system.",
    deadline: "2026-05-15",
    employerName: "FitLife Inc",
  },
];

export async function GET() {
  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, budget, description, deadline, employerTelegramId } = body;

    if (!title || !budget || !description || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newJob = {
      id: Date.now().toString(),
      title,
      budget,
      description,
      deadline,
      employerName: `Employer ${employerTelegramId || "Unknown"}`,
    };

    jobs.push(newJob);

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}