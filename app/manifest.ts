import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Securinets ISET Charguia",
    short_name: "SNT ISET",
    description:
      "Cybersecurity club of ISET Charguia: challenges, workshops and CTF training.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080b",
    theme_color: "#B3001B",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
