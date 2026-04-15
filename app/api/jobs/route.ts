import { NextRequest, NextResponse } from "next/server";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
  employerTelegramId?: number;
  status: "active" | "draft" | "expired";
  discipline?: string;
  jobType?: string;
  isPinned?: boolean;
  broadcastToChannel?: boolean;
  applicants: number;
  createdAt: string;
}

interface Applicant {
  id: string;
  fullName: string;
  professionalTitle: string;
  bio: string;
  skills: string[];
  portfolioLink?: string;
  telegramId: number;
  appliedAt: string;
  status: "pending" | "shortlisted" | "declined";
  jobId: string;
}

const jobs: Job[] = [
  {
    id: "1",
    title: "Logo Design for Tech Startup",
    budget: "$500 - $800",
    description: "Looking for a creative designer to create a modern, minimalist logo for our AI-powered productivity app. Must have experience with tech/SaaS brands.",
    deadline: "2026-04-30",
    employerName: "TechFlow",
    status: "active",
    discipline: "branding",
    jobType: "remote",
    applicants: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "UI/UX Redesign for Mobile App",
    budget: "$2000 - $3000",
    description: "We need a complete UI/UX overhaul for our fitness tracking mobile app. Deliverables include wireframes, high-fidelity mockups, and a design system.",
    deadline: "2026-05-15",
    employerName: "FitLife Inc",
    status: "active",
    discipline: "ui-ux",
    jobType: "hybrid",
    applicants: 8,
    createdAt: new Date().toISOString(),
  },
];

const applicants: Applicant[] = [
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

export async function GET(request: NextRequest, { params }: { params: { jobId?: string } }) {
  const jobId = params?.jobId;

  if (jobId && jobId !== "apply") {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const jobApplicants = applicants.filter((a) => a.jobId === jobId);
      return NextResponse.json({ jobs: [job], applicants: jobApplicants });
    }
    return NextResponse.json({ jobs: [], error: "Job not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const employerId = searchParams.get("employerId");
  const status = searchParams.get("status");

  let filteredJobs = [...jobs];

  if (employerId) {
    filteredJobs = filteredJobs.filter((j) => j.employerTelegramId === parseInt(employerId));
  }

  if (status) {
    filteredJobs = filteredJobs.filter((j) => j.status === status);
  }

  filteredJobs.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({ jobs: filteredJobs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      budget, 
      description, 
      deadline, 
      employerTelegramId,
      discipline,
      jobType,
      isPinned,
      broadcastToChannel,
    } = body;

    if (!title || !budget || !description || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newJob: Job = {
      id: Date.now().toString(),
      title,
      budget,
      description,
      deadline,
      employerName: `Employer ${employerTelegramId || "Unknown"}`,
      employerTelegramId,
      status: "active",
      discipline,
      jobType,
      isPinned,
      broadcastToChannel,
      applicants: 0,
      createdAt: new Date().toISOString(),
    };

    jobs.push(newJob);

    if (broadcastToChannel) {
      console.log(`Job "${title}" would be broadcast to channel: https://t.me/CreativePortalJobs`);
    }

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, status } = body;

    const job = jobs.find((j) => j.id === jobId);
    if (job && status) {
      job.status = status as Job["status"];
      return NextResponse.json({ success: true, job });
    }

    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { jobId?: string } }) {
  const jobId = params?.jobId;

  if (jobId === "apply") {
    try {
      const body = await request.json();
      const { jobId: appliedJobId, telegramId, coverLetter, portfolioLinks, telegramUsername } = body;

      if (!appliedJobId || !telegramId || !coverLetter) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const job = jobs.find((j) => j.id === appliedJobId);
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      job.applicants += 1;

      const newApplicant: Applicant = {
        id: Date.now().toString(),
        fullName: `User ${telegramId}`,
        professionalTitle: "Applicant",
        bio: coverLetter,
        skills: [],
        portfolioLink: portfolioLinks?.[0]?.url || "",
        telegramId,
        appliedAt: new Date().toISOString(),
        status: "pending",
        jobId: appliedJobId,
      };

      applicants.push(newApplicant);

      return NextResponse.json({ success: true, applicant: newApplicant }, { status: 201 });
    } catch (error) {
      console.error("Error submitting application:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid route" }, { status: 404 });
}