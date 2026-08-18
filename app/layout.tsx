import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator AI Studio",
  description: "Prompt-to-image and prompt-to-video creative studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
