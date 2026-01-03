import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuSign Template Automation",
  description: "Automate DocuSign template generation",
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

