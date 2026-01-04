import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Document Template Generator - Professional PDF Documents in Minutes",
  description: "Generate professional PDF document templates quickly and easily. Create letters of recommendation, employment letters, business documents, and more with customizable templates and formatting options.",
  keywords: ["document generator", "PDF generator", "letter templates", "business documents", "document templates", "professional letters", "employment letters", "recommendation letters", "DocuSign ready"],
  authors: [{ name: "Fountain" }],
  creator: "Fountain Document Generator",
  publisher: "Fountain",
  applicationName: "Document Template Generator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docusign-redone.vercel.app",
    title: "Document Template Generator - Professional PDF Documents",
    description: "Create professional business documents, letters, and templates in minutes. Perfect for HR, business communications, and more.",
    siteName: "Document Template Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Document Template Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Document Template Generator",
    description: "Generate professional PDF documents in minutes",
    images: ["/og-image.png"],
    creator: "@fountain",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

