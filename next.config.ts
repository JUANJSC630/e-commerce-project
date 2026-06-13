import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"

// Secure-fields iframes load from MP subdomains beyond sdk.mercadopago.com,
// and UploadThing uploads go browser-direct to *.ingest.uploadthing.com.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://sdk.mercadopago.com https://*.mercadopago.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.ufs.sh https://utfs.io https://*.mercadopago.com",
  "frame-src https://sdk.mercadopago.com https://*.mercadopago.com",
  `connect-src 'self' https://*.mercadopago.com https://*.uploadthing.com${isProd ? "" : " ws:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ")

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
]

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
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },
}

export default nextConfig
