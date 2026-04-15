"use client";

import { Briefcase, User, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  type: "jobs" | "profile";
}

export function EmptyState({ type }: EmptyStateProps) {
  const content = {
    jobs: {
      icon: Briefcase,
      title: "No jobs found",
      description: "Check back later for new opportunities",
    },
    profile: {
      icon: User,
      title: "No profile yet",
      description: "Create your profile to get started",
    },
  };

  const { icon: Icon, title, description } = content[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="bg-tg-secondary/30 backdrop-blur-md p-6 rounded-full mb-4">
        <Icon className="w-12 h-12 text-tg-hint" />
      </div>
      <h3 className="text-lg font-semibold text-tg-text mb-2">{title}</h3>
      <p className="text-tg-hint text-center">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-6 h-6 text-tg-button animate-spin" />
      <span className="ml-2 text-tg-hint">Loading...</span>
    </div>
  );
}