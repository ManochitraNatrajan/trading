import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SecurityWrapper from "@/components/SecurityWrapper";
import { AuthProvider } from "@/lib/AuthContext";
import Navigation from "@/components/Navigation";
import "./globals.css";const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prathik Algo Lab",
  description: "Advanced algorithmic trading simulator and live signal portal.",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prathik Algo Lab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navigation />
          <SecurityWrapper>{children}</SecurityWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
