import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const baseHeaders: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "style-src 'self' 'unsafe-inline' https://accounts.google.com",
            "style-src-elem 'self' 'unsafe-inline' https://accounts.google.com",
            `script-src 'self' 'unsafe-inline' https://accounts.google.com${
              process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
            }`,
            "connect-src 'self' https://accounts.google.com https://*.google.com",
            "frame-src https://accounts.google.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
    ];

    // HSTS hanya di production (butuh HTTPS)
    if (process.env.NODE_ENV === "production") {
      baseHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: baseHeaders,
      },
    ];
  },
};

export default nextConfig;
