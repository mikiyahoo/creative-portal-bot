"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Palette, Link as LinkIcon, Check, Sparkles } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const profileSchema = z.object({
  professionalTitle: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters").max(500),
  portfolioLink: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const SKILLS = [
  { id: "ui-ux", label: "UI/UX Design", icon: "🎨" },
  { id: "branding", label: "Branding", icon: "✨" },
  { id: "3d", label: "3D Modeling", icon: "🎮" },
  { id: "illustration", label: "Illustration", icon: "🖼️" },
  { id: "motion", label: "Motion Graphics", icon: "🎬" },
  { id: "video", label: "Video Editing", icon: "📹" },
  { id: "photo", label: "Photography", icon: "📷" },
  { id: "web", label: "Web Development", icon: "💻" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { tg, user } = useTelegram();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      professionalTitle: "",
      bio: "",
      portfolioLink: "",
    },
  });

  useEffect(() => {
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        router.back();
      });
    }
  }, [tg, router]);

  const toggleSkill = useCallback((skill: string) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  }, [tg]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!tg) return;
    
    tg.HapticFeedback.impactOccurred("medium");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fullName: user?.first_name,
          skills: selectedSkills,
          telegramId: user?.id,
        }),
      });

      if (response.ok) {
        tg.HapticFeedback.notificationOccurred("success");
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["professionalTitle", "bio"]);
      if (!valid) return;
    }
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 2 && selectedSkills.length === 0) return false;
    return true;
  };

  useEffect(() => {
    if (!tg) return;

    if (step === 3) {
      tg.MainButton.setText("Create Profile");
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        handleSubmit(onSubmit)();
      });
    } else {
      tg.MainButton.setText("Continue");
      tg.MainButton.show();
      tg.MainButton.onClick(nextStep);
      if (!canProceed()) {
        tg.MainButton.disable();
      } else {
        tg.MainButton.enable();
      }
    }

    return () => {
      tg.MainButton.offClick(nextStep);
      tg.MainButton.hide();
    };
  }, [step, tg, handleSubmit, nextStep, canProceed]);

  return (
    <div className="min-h-screen bg-light-bg p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-light-border rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-light-text-primary" />
          </button>
          <h1 className="text-xl font-extrabold text-light-text-primary uppercase">Create Profile</h1>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step 
                  ? "bg-brand-yellow" 
                  : "bg-light-border"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-light-surface rounded-3xl p-6 border border-light-border shadow-sm">
                <h2 className="text-lg font-bold text-light-text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-yellow" />
                  Tell us about yourself
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-light-text-primary mb-2">
                      Professional Title
                    </label>
                    <div className="relative">
                      <Palette className="absolute left-3 top-3 w-5 h-5 text-light-text-muted" />
                      <input
                        {...register("professionalTitle")}
                        className="w-full pl-10 p-3.5 bg-light-bg border border-light-border rounded-2xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                        placeholder="e.g., Motion Designer"
                      />
                    </div>
                    {errors.professionalTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.professionalTitle.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-light-text-primary mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register("bio")}
                      className="w-full p-3.5 bg-light-bg border border-light-border rounded-2xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow h-32 resize-none"
                      placeholder="Share your experience, style, and what makes you unique..."
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-light-surface rounded-3xl p-6 border border-light-border shadow-sm">
                <h2 className="text-lg font-bold text-light-text-primary mb-2">
                  Select Your Skills
                </h2>
                <p className="text-light-text-muted text-sm mb-6">
                  Choose the skills that best represent your expertise
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        selectedSkills.includes(skill.id)
                          ? "bg-brand-yellow text-black shadow-md"
                          : "bg-light-bg border border-light-border text-light-text-primary hover:border-brand-yellow"
                      }`}
                    >
                      <span className="mr-1.5">{skill.icon}</span>
                      {skill.label}
                    </button>
                  ))}
                </div>
                {selectedSkills.length === 0 && (
                  <p className="text-light-text-muted text-sm mt-4">
                    Select at least one skill to continue
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={prevStep}
                className="w-full py-3.5 bg-light-border text-light-text-primary rounded-2xl font-bold"
              >
                Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-light-surface rounded-3xl p-6 border border-light-border shadow-sm">
                <h2 className="text-lg font-bold text-light-text-primary mb-4">
                  Portfolio (Optional)
                </h2>
                
                <div>
                  <label className="block text-sm font-bold text-light-text-primary mb-2">
                    Portfolio Link
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-light-text-muted" />
                    <input
                      {...register("portfolioLink")}
                      className="w-full pl-10 p-3.5 bg-light-bg border border-light-border rounded-2xl text-light-text-primary focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                      placeholder="https://dribbble.com/yourname"
                    />
                  </div>
                  {errors.portfolioLink && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.portfolioLink.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-brand-yellow/10 rounded-3xl p-6 border border-brand-yellow/30">
                <h3 className="font-bold text-light-text-primary mb-4">Profile Preview</h3>
                <div className="space-y-2">
                  <p className="text-light-text-primary">
                    <span className="text-light-text-muted">Name:</span> {user?.first_name}
                  </p>
                  <p className="text-light-text-primary">
                    <span className="text-light-text-muted">Title:</span> {""}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedSkills.map((skillId) => {
                      const skill = SKILLS.find(s => s.id === skillId);
                      return (
                        <span 
                          key={skillId} 
                          className="px-2 py-1 bg-brand-yellow/20 text-brand-yellow text-xs font-bold rounded-full"
                        >
                          {skill?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={prevStep}
                className="w-full py-3.5 bg-light-border text-light-text-primary rounded-2xl font-bold"
              >
                Back
              </button>
            </div>
          )}

          {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-light-surface p-6 rounded-3xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-yellow"></div>
                <span className="text-light-text-primary font-bold">Creating profile...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}