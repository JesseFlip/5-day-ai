import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { DemoBanner } from "@/components/demo-banner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentPath — Learn AI Agents",
  description:
    "A self-paced interactive roadmap through the Kaggle 5-Day AI Agents course. Built with Claude via Lumbergh. Not a competition entry.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
          <Providers>
            {process.env.DEMO_MODE === "true" && <DemoBanner />}
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
