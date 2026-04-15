import { NextRequest, NextResponse } from "next/server";

const applicants = [
  {
    id: "1",
    fullName: "Alex Designer",
    professionalTitle: "UI/UX Designer",
    bio: "Passionate about creating user-centered designs with 5+ years of experience in mobile and web applications.",
    skills: ["UI/UX", "Figma", "Prototyping"],
    portfolioLink: "https://dribbble.com/alex",
    telegramId: 123456789,
    appliedAt: new Date().toISOString(),
    status: "pending",
    jobId: "1",
  },
  {
    id: "2",
    fullName: "Maria Creative",
    professionalTitle: "Brand Designer",
    bio: "Specializing in brand identity and visual design for startups and small businesses.",
    skills: ["Branding", "Illustration", "Logo Design"],
    portfolioLink: "https://behance.net/maria",
    telegramId: 987654321,
    appliedAt: new Date().toISOString(),
    status: "pending",
    jobId: "1",
  },
  {
    id: "3",
    fullName: "John Motion",
    professionalTitle: "Motion Designer",
    bio: "Creating engaging animations and motion graphics for social media and ads.",
    skills: ["After Effects", "Animation", "3D"],
    portfolioLink: "https://vimeo.com/john",
    telegramId: 111222333,
    appliedAt: new Date().toISOString(),
    status: "shortlisted",
    jobId: "1",
  },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicantId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const applicantId = params.applicantId;

    const applicant = applicants.find((a) => a.id === applicantId);
    if (applicant) {
      applicant.status = status as "pending" | "shortlisted" | "declined";
      return NextResponse.json({ success: true, applicant });
    }

    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}