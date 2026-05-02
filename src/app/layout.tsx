import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC BG Pack Builder — Minecraft Background Tool",
  description:
    "Free tool to replace your Minecraft Bedrock or Java main menu background with any image. No sign-up, runs entirely in your browser.",
  openGraph: {
    title: "MC BG Pack Builder",
    description:
      "Replace your Minecraft main menu background with any image. Free, instant, no sign-up.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3dff72",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
