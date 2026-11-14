import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://securinets-isetch.tn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/login", "/register"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
