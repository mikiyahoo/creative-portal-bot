"use client";

import { useRouter } from "next/navigation";
import { Building2, MapPin, Briefcase, BarChart, Clock } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
  discipline?: string;
  jobType?: string;
  location?: string;
  experience?: string;
  createdAt?: string;
}

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const router = useRouter();
  const { tg } = useTelegram();

  const handleViewDetails = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    router.push(`/apply/${job.id}`);
  };

  const handleApply = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    
    tg?.showConfirm(
      `Apply for "${job.title}"?`,
      (confirmed) => {
        if (confirmed) {
          tg?.HapticFeedback?.notificationOccurred("success");
          onApply?.(job.id);
        }
      }
    );
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const formatJobType = (type?: string) => {
    if (type === "remote") return "Remote";
    if (type === "hybrid") return "Hybrid";
    if (type === "onsite") return "On-site";
    return "Full-time";
  };

  const formatDiscipline = (disc?: string) => {
    const map: Record<string, string> = {
      "ui-ux": "UI/UX Design",
      "branding": "Branding",
      "illustration": "Illustration",
      "motion": "Motion Graphics",
      "3d": "3D Modeling",
      "video": "Video Production",
      "web": "Web Development",
      "photography": "Photography",
    };
    return map[disc || ""] || disc || "General";
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-text-primary text-lg leading-tight">{job.title}</h3>
        {job.isPinned && (
          <span className="px-2 py-1 bg-primary-light text-primary text-xs font-medium rounded-full">
            Pinned
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
        <Building2 className="w-4 h-4" />
        <span className="font-medium">{job.employerName}</span>
        <span className="text-text-muted">•</span>
        <span className="text-text-muted">{getTimeAgo(job.createdAt)}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
          {formatDiscipline(job.discipline)}
        </span>
        {job.jobType && (
          <span className="px-3 py-1 bg-gray-100 text-text-secondary text-xs font-medium rounded-full">
            {formatJobType(job.jobType)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-text-muted text-sm mb-4">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium text-primary">{job.budget}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
        )}
        {job.experience && (
          <div className="flex items-center gap-1">
            <BarChart className="w-4 h-4" />
            <span>{job.experience}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Briefcase className="w-4 h-4" />
          <span>{formatJobType(job.jobType)}</span>
        </div>
      </div>

      <p className="text-text-secondary text-sm line-clamp-2 mb-4">{job.description}</p>

      <div className="flex gap-3">
        <button
          onClick={handleViewDetails}
          className="flex-1 py-3 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary-light transition-colors"
        >
          View Details
        </button>
        {onApply && (
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark active:scale-95 transition-all"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
}