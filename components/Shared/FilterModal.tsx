"use client";

import { useState } from "react";
import { X, ChevronDown, RotateCcw } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
}

export interface Filters {
  jobType: string[];
  jobSite: string[];
  experience: string[];
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance"];
const JOB_SITES = ["Remote", "On-site", "Hybrid"];
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Lead"];

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const { tg } = useTelegram();
  const [filters, setFilters] = useState<Filters>({
    jobType: [],
    jobSite: [],
    experience: [],
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleFilter = (category: keyof Filters, value: string) => {
    tg?.HapticFeedback?.impactOccurred("light");
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  };

  const resetFilters = () => {
    tg?.HapticFeedback?.impactOccurred("light");
    setFilters({ jobType: [], jobSite: [], experience: [] });
  };

  const handleApply = () => {
    tg?.HapticFeedback?.notificationOccurred("success");
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full bg-surface rounded-t-3xl max-h-[80vh] overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-text-primary">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-text-muted text-sm hover:text-primary transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset all
          </button>
        </div>

        <div className="overflow-y-auto max-h-[50vh] p-6 space-y-4">
          <FilterSection
            title="Job Type"
            options={JOB_TYPES}
            selected={filters.jobType}
            onToggle={(value) => toggleFilter("jobType", value)}
            isExpanded={expandedSection === "jobType"}
            onToggleExpand={() => setExpandedSection(expandedSection === "jobType" ? null : "jobType")}
          />
          <FilterSection
            title="Job Site"
            options={JOB_SITES}
            selected={filters.jobSite}
            onToggle={(value) => toggleFilter("jobSite", value)}
            isExpanded={expandedSection === "jobSite"}
            onToggleExpand={() => setExpandedSection(expandedSection === "jobSite" ? null : "jobSite")}
          />
          <FilterSection
            title="Experience Level"
            options={EXPERIENCE_LEVELS}
            selected={filters.experience}
            onToggle={(value) => toggleFilter("experience", value)}
            isExpanded={expandedSection === "experience"}
            onToggleExpand={() => setExpandedSection(expandedSection === "experience" ? null : "experience")}
          />
        </div>

        <div className="p-6 pt-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 border-2 border-gray-200 text-text-secondary rounded-xl font-bold text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-lg active:scale-95 transition-all"
          >
            Filter
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function FilterSection({ title, options, selected, onToggle, isExpanded, onToggleExpand }: FilterSectionProps) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-text-primary">{title}</span>
        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-text-secondary">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}