import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quản lý thu chi gia đình",
    short_name: "Thu chi gia đình",
    description: "Ứng dụng quản lý thu chi cho gia đình",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f9f9f7",
    theme_color: "#2a78d6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
