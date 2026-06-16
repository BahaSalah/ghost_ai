import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EditorShell } from "@/components/editor/editor-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ghoast ai",
  description: "ghoast ai editor",
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
      <body className="min-h-full">
        <EditorShell>{children}</EditorShell>
      </body>
    </html>
  );
}
