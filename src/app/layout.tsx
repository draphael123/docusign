import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Template Generator",
  description: "Generate professional PDF document templates with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

