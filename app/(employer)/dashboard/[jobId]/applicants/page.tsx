"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, User, ExternalLink, Check, X, MessageCircle, Briefcase } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

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
}

interface Job {
  id: string;
  title: string;
}

export default function ApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const { tg } = useTelegram();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const jobId = params?.jobId as string;

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.push("/dashboard");
      });
    }

    fetchApplicants();
  }, [tg, router, jobId]);

  const fetchApplicants = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applicants`);
      if (response.ok) {
        const data = await response.json();
        setApplicants(data.applicants || []);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicantId: string, action: "shortlist" | "decline") => {
    if (!tg) return;

    const confirmMessage = action === "shortlist" 
      ? "Shortlist this candidate?" 
      : "Decline this candidate?";

    tg.showConfirm(confirmMessage, async (confirmed) => {
      if (confirmed) {
        tg.HapticFeedback.impactOccurred("medium");
        
        try {
          await fetch(`/api/jobs/applicants/${applicantId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: action === "shortlist" ? "shortlisted" : "declined" }),
          });
          
          tg.HapticFeedback.notificationOccurred("success");
          fetchApplicants();
        } catch (error) {
          console.error("Error updating applicant:", error);
        }
      }
    });
  };

  const handleContact = (telegramUsername?: string) => {
    if (tg) {
      if (telegramUsername) {
        tg.openTelegramLink(`https://t.me/${telegramUsername}`);
      } else {
        tg.showAlert("No Telegram username available. The user needs to set one in their Telegram settings.");
      }
    }
  };

  const handleViewPortfolio = (url?: string) => {
    if (tg && url) {
      tg.openLink(url);
    } else if (tg) {
      tg.showAlert("No portfolio link available");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-500",
      shortlisted: "bg-green-500/20 text-green-500",
      declined: "bg-red-500/20 text-red-500",
    };
    const labels = {
      pending: "Pending",
      shortlisted: "Shortlisted",
      declined: "Declined",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-light-bg p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-light-border rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-light-text-primary" />
          </button>
          <h1 className="text-xl font-bold text-light-text-primary">Applicants</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-light-surface animate-pulse rounded-xl p-4 h-40" />
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-light-surface rounded-2xl p-8 text-center border border-light-border">
            <User className="w-12 h-12 text-light-text-muted mx-auto mb-3" />
            <p className="text-light-text-primary font-medium">No applicants yet</p>
            <p className="text-light-text-muted text-sm mt-2">
              Applicants will appear here when they apply
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-light-surface rounded-2xl p-5 border border-light-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-yellow/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-light-text-primary">{applicant.fullName}</h3>
                      <p className="text-light-text-muted text-sm flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {applicant.professionalTitle}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(applicant.status)}
                </div>

                <p className="text-light-text-secondary text-sm mb-3 line-clamp-2">{applicant.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {applicant.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-brand-yellow/10 text-brand-yellow text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewPortfolio(applicant.portfolioLink)}
                    className="flex-1 py-2 bg-brand-yellow/10 text-brand-yellow rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Portfolio
                  </button>
                  
                  <button
                    onClick={() => handleContact(applicant.telegramId.toString())}
                    className="flex-1 py-2 bg-brand-yellow/10 text-brand-yellow rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact
                  </button>
                </div>

                {applicant.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAction(applicant.id, "shortlist")}
                      className="flex-1 py-2 bg-green-500/20 text-green-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleAction(applicant.id, "decline")}
                      className="flex-1 py-2 bg-red-500/20 text-red-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}