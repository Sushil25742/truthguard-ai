import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TruthGuard AI - Fake News Detector",
  description: "Detect whether news text is fake or real using DistilBERT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
      </body>
    </html>
  );
}
