import type { NextConfig } from "next";

/**
 * Clerk's Frontend API host is encoded in the publishable key
 * (pk_test_/pk_live_ + base64("<host>$")). In production this is a custom
 * subdomain like clerk.example.com, so it must be allow-listed explicitly.
 */
function clerkFrontendApiHost(): string | null {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return null;
  try {
    const decoded = Buffer.from(key.split("_")[2] ?? "", "base64").toString("utf8");
    const host = decoded.replace(/\$$/, "");
    return /^[a-z0-9.-]+$/i.test(host) ? `https://${host}` : null;
  } catch {
    return null;
  }
}

const clerkHost = clerkFrontendApiHost();
const clerkSources = [
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
  ...(clerkHost ? [clerkHost] : []),
].join(" ");
// Vercel's preview toolbar (comments / feedback) is injected on preview deployments.
const vercelLive = process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : "";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Clerk requires broad script/connect allowances for its hosted components.
    // In production, tighten 'unsafe-inline' with a nonce strategy.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${clerkSources} https://challenges.cloudflare.com${vercelLive}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://vercel.live",
      "img-src 'self' data: https: blob:",
      `connect-src 'self' ${clerkSources} wss://*.clerk.accounts.dev https://*.upstash.io https://api.anthropic.com https://generativelanguage.googleapis.com${vercelLive}${vercelLive ? " wss://ws-us3.pusher.com" : ""}`,
      `frame-src ${clerkSources} https://challenges.cloudflare.com${vercelLive}`,
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The tutor route reads SKILL.md from disk at runtime; make sure Vercel's
  // file tracing bundles it into the serverless function.
  outputFileTracingIncludes: {
    "/api/tutor": ["./lib/agents/tutor/SKILL.md"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
