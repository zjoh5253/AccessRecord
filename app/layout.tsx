import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccessRecord — Audit Logging for SaaS",
  description:
    "Drop-in audit logging API for SaaS applications. Add SOC 2 audit logs to your app in 10 minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
