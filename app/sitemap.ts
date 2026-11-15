import type { MetadataRoute } from "next";
import { getAllChallenges } from "@/lib/challenges";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://securinets-isetch.tn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const challenges = await getAllChallenges();
  const pages = ["", "/about", "/challenges", "/events", "/learning", "/leaderboard", "/team", "/join", "/contact", "/verify"];

  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "" ? 1 : 0.7,
    })),
    ...challenges.map((challenge) => ({
      url: `${base}/challenges/${challenge.slug}`,
      lastModified: new Date(challenge.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
