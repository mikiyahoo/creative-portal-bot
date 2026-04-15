"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Plus, Minus, Info, MessageCircle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const applySchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters").max(1000),
  portfolioLinks: z.array(z.object({
    url: z.string().url("Invalid URL"),
  })).max(5, "Maximum 5 links allowed"),
  telegramUsername: z.string().optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface Job {
  id: string;
  title: string;
  budget: string;
  description: string;
  employerName: string;
  deadline: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const { tg, user } = useTelegram();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      coverLetter: "",
      portfolioLinks: [{ url: "" }],
      telegramUsername: user?.username || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "portfolioLinks",
  });

  const coverLetter = watch("coverLetter", "");
  const maxLength = 1000;
  const charactersLeft = maxLength - coverLetter.length;

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }

    fetchJob();
  }, [tg, router, params.jobId]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.jobs?.[0] || data);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ApplyFormData) => {
    if (!tg) return;

    tg.HapticFeedback.notificationOccurred("success");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: params.jobId,
          telegramId: user?.id,
          ...data,
        }),
      });

      if (response.ok) {
        tg.showAlert("Application submitted successfully! We'll be in touch soon.");
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (tg) {
      tg.MainButton.setText("Submit Application");
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        handleSubmit(onSubmit)();
      });
    }

    return () => {
      tg?.MainButton.hide();
    };
  }, [tg, handleSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-text-secondary">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Apply Now</h1>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="font-bold text-text-primary text-lg mb-2">{job.title}</h2>
          <p className="text-text-secondary text-sm mb-2">{job.employerName}</p>
          <p className="text-primary font-medium">{job.budget}</p>
        </div>

        <form className="space-y-6">
          <div className="bg-surface rounded-2xl p-6 border border-gray-100">
            <label className="font-bold text-text-primary block mb-2">
              Cover Letter
            </label>
            <div className="relative">
              <textarea
                {...register("coverLetter")}
                className="w-full rounded-xl border-gray-200 p-4 h-40 focus:ring-2 focus:ring-primary focus:border-primary resize-none text-text-primary bg-background"
                placeholder="Tell the employer why you're the perfect fit for this role..."
              />
              <span className={`absolute bottom-3 right-4 text-xs ${charactersLeft < 100 ? "text-red-500" : "text-text-muted"}`}>
                {charactersLeft} Characters left
              </span>
            </div>
            {errors.coverLetter && (
              <p className="text-red-500 text-sm mt-1">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 text-sm">Privacy Tip</p>
                <p className="text-green-700 text-xs mt-1">
                  Make sure your Telegram username is set and your privacy settings allow others to see it. Go to Settings → Privacy → Telegram Username.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-gray-100">
            <label className="font-bold text-text-primary block mb-4">
              Your Telegram Username
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
              <input
                {...register("telegramUsername")}
                className="w-full pl-10 p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-text-primary bg-background"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="font-bold text-text-primary">
                Portfolio Links
              </label>
              {fields.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    tg?.HapticFeedback?.impactOccurred("light");
                    append({ url: "" });
                  }}
                  className="flex items-center gap-1 text-primary text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add more
                </button>
              )}
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`portfolioLinks.${index}.url` as const)}
                    className="flex-1 p-3 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-text-primary bg-background"
                    placeholder="https://dribbble.com/yourwork"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        tg?.HapticFeedback?.impactOccurred("light");
                        remove(index);
                      }}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.portfolioLinks && (
              <p className="text-red-500 text-sm mt-2">{errors.portfolioLinks.message || errors.portfolioLinks.root?.message}</p>
            )}
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-surface p-6 rounded-2xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-text-primary">Submitting...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}