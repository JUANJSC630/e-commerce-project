import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      // UploadThing CDN — per-app subdomain (v7) + legacy host.
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/*" },
      { protocol: "https", hostname: "utfs.io", pathname: "/f/*" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
}

export default nextConfig
