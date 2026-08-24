import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Supabase client-side calls (auth, storage, realtime) go straight from the
// browser to the project URL, so it has to be allowed as a connect-src.
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : "https://*.supabase.co";
  } catch {
    return "https://*.supabase.co";
  }
})();

// No nonce-based CSP here: this app relies on static generation/ISR for
// several routes (nonces force fully dynamic rendering on every page, per
// Next's CSP guide). 'unsafe-inline' on script-src is required because
// Next.js injects inline bootstrap/hydration scripts on every page; the app
// has no dangerouslySetInnerHTML/raw-HTML rendering, so the residual risk
// is limited to what object-src/base-uri/frame-ancestors below still block.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self' data:;
  connect-src 'self' ${supabaseOrigin};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // Don't advertise the framework/version to every response.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
