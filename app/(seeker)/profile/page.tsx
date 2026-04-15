"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Palette, Link as LinkIcon, Sparkles } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const profileSchema = z.object({
  professionalTitle: z.string().min(2, "Title is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters").max(500),
  portfolioLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const SKILLS = [
  { id: "ui-ux", label: "UI/UX", icon: "🎨" },
  { id: "branding", label: "Branding", icon: "✨" },
  { id: "3d", label: "3D", icon: "🎮" },
  { id: "illustration", label: "Illustration", icon: "🖼️" },
  { id: "motion", label: "Motion", icon: "🎬" },
  { id: "video", label: "Video", icon: "📹" },
  { id: "photo", label: "Photo", icon: "📷" },
  { id: "web", label: "Web", icon: "💻" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      professionalTitle: "",
      bio: "",
      portfolioLink: "",
      skills: [],
    },
  });

  const selectedSkills = watch("skills");

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }
  }, [tg, router]);

  const toggleSkill = useCallback((skillId: string) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    const current = watch("skills") || [];
    const newSkills = current.includes(skillId)
      ? current.filter((s) => s !== skillId)
      : [...current, skillId];
    setValue("skills", newSkills, { shouldValidate: true });
  }, [tg, watch, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!tg) return;
    
    tg.HapticFeedback.impactOccurred("medium");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalTitle: data.professionalTitle,
          bio: data.bio,
          portfolioLink: data.portfolioLink,
          fullName: user?.first_name,
          skills: data.skills,
          telegramId: user?.id,
        }),
      });

      if (response.ok) {
        tg.HapticFeedback.notificationOccurred("success");
        router.push("/jobs");
      } else {
        tg.showAlert("Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      tg.showAlert("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!tg) return;

    tg.MainButton.setText("Create Profile");
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      handleSubmit(onSubmit)();
    });

    return () => {
      tg.MainButton.offClick(handleSubmit(onSubmit));
      tg.MainButton.hide();
    };
  }, [tg, handleSubmit]);

  return (
    <div className="min-h-screen bg-light-bg px-4 pt-4 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-light-border rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-light-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-light-text-primary">Create Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-light-surface rounded-2xl p-4 border border-light-border">
            <h2 className="text-sm font-bold text-light-text-primary mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              About You
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-light-text-secondary mb-1.5">
                  Professional Title
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-2.5 w-4 h-4 text-light-text-muted" />
                  <input
                    {...register("professionalTitle")}
                    className="w-full pl-9 p-2.5 bg-light-bg border border-light-border rounded-xl text-sm text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    placeholder="e.g. Motion Designer"
                  />
                </div>
                {errors.professionalTitle && (
                  <p className="text-red-500 text-xs mt-1">{errors.professionalTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-light-text-secondary mb-1.5">
                  Bio (20-500 chars)
                </label>
                <textarea
                  {...register("bio")}
                  className="w-full p-2.5 bg-light-bg border border-light-border rounded-xl text-sm text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow h-20 resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-light-surface rounded-2xl p-4 border border-light-border">
            <h2 className="text-sm font-bold text-light-text-primary mb-3">Your Skills</h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedSkills.includes(skill.id)
                      ? "bg-brand-yellow text-black"
                      : "bg-light-bg border border-light-border text-light-text-primary"
                  }`}
                >
                  <span className="mr-1">{skill.icon}</span>
                  {skill.label}
                </button>
              ))}
            </div>
            {errors.skills && (
              <p className="text-red-500 text-xs mt-2">{errors.skills.message}</p>
            )}
          </div>

          <div className="bg-light-surface rounded-2xl p-4 border border-light-border">
            <h2 className="text-sm font-bold text-light-text-primary mb-3">Portfolio (Optional)</h2>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-light-text-muted" />
              <input
                {...register("portfolioLink")}
                className="w-full pl-9 p-2.5 bg-light-bg border border-light-border rounded-xl text-sm text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                placeholder="https://dribbble.com/yourname"
              />
            </div>
            {errors.portfolioLink && (
              <p className="text-red-500 text-xs mt-1">{errors.portfolioLink.message}</p>
            )}
          </div>

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-light-surface p-4 rounded-2xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-yellow"></div>
                <span className="text-sm text-light-text-primary">Creating profile...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}