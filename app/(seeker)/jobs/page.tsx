"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { JobCard } from "@/components/ui/JobCard";
import { JobFeedSkeleton, JobCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push("/");
      });

      tg.onEvent("mainButtonClicked", () => {
        tg.HapticFeedback.impactOccurred("light");
        fetchJobs(true);
      });
    }

    fetchJobs();

    return () => {
      if (tg) {
        tg.BackButton.hide();
        tg.offEvent("mainButtonClicked", fetchJobs);
      }
    };
  }, [tg, router, fetchJobs]);

  useEffect(() => {
    if (tg && !loading) {
      tg.MainButton.setText("Refresh");
      tg.MainButton.show();
    }
  }, [tg, loading]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          telegramId: user?.id,
        }),
      });

      if (response.ok) {
        tg?.showAlert("Application submitted successfully!");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      tg?.showAlert("Failed to submit application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tg-bg p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-tg-text mb-6">Browse Jobs</h1>
          <JobFeedSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-tg-text">Browse Jobs</h1>
          {refreshing && (
            <RefreshCw className="w-5 h-5 text-tg-button animate-spin" />
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-5 h-5 text-tg-hint" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-3 bg-tg-secondary/50 backdrop-blur-md border border-white/10 rounded-xl text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
            placeholder="Search jobs..."
          />
        </div>

        {filteredJobs.length === 0 ? (
          <EmptyState type="jobs" />
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}