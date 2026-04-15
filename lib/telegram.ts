export interface JobPost {
  id: string;
  title: string;
  budget: string;
  description: string;
  deadline: string;
  employerName: string;
  discipline?: string;
  jobType?: string;
  isPinned?: boolean;
}

export function formatJobForChannel(job: JobPost): string {
  const jobTypeEmoji = {
    remote: "🏠",
    hybrid: "🏢",
    onsite: "📍",
  };

  const jobType = job.jobType ? jobTypeEmoji[job.jobType as keyof typeof jobTypeEmoji] || "" : "";

  const message = `
🎨 *${job.title}*

💰 Budget: ${job.budget}
📍 Type: ${jobType}
⏰ Deadline: ${job.deadline}

${job.description.slice(0, 200)}${job.description.length > 200 ? "..." : ""}

🏢 ${job.employerName}

#CreativeJobs #${job.discipline?.replace("-", "") || "Jobs"}
  `.trim();

  return message;
}

export function getChannelLink(): string {
  return "https://t.me/CreativePortalJobs";
}

export function getTelegramUserLink(username: string): string {
  return `https://t.me/${username}`;
}