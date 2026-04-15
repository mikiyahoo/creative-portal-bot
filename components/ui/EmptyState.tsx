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
      <div className="bg-brand-yellow/10 p-6 rounded-full mb-4">
        <Icon className="w-12 h-12 text-brand-yellow" />
      </div>
      <h3 className="text-lg font-bold text-light-text-primary mb-2">{title}</h3>
      <p className="text-light-text-muted text-center">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-6 h-6 text-brand-yellow animate-spin" />
      <span className="ml-2 text-light-text-muted">Loading...</span>
    </div>
  );
}