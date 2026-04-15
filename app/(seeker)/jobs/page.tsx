"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, DollarSign } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
}

export default function JobsPage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push("/");
      });
    }
  }, [tg, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJobClick = (jobId: string) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    router.push(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tg-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tg-button"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-tg-secondary rounded-lg"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-tg-text">Browse Jobs</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-3 bg-tg-secondary rounded-lg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
            placeholder="Search jobs..."
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-tg-hint">No jobs available yet.</p>
            <p className="text-tg-hint text-sm mt-2">Check back later!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => handleJobClick(job.id)}
                className="w-full text-left p-4 bg-tg-secondary rounded-xl transition-transform active:scale-[0.98]"
              >
                <h3 className="font-semibold text-tg-text">{job.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-tg-hint text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.budget}</span>
                </div>
                <p className="text-tg-hint text-sm mt-2 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-tg-hint">
                  <span>By {job.employerName}</span>
                  <span>Due: {job.deadline}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}