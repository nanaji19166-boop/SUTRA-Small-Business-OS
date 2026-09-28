import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SUTRA — Small Business OS",
    short_name: "SUTRA",
    description: "Simple sales, stock, collections and business operations for small businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#312e81",
    lang: "en",
    categories: ["business", "productivity"],
  };
}
