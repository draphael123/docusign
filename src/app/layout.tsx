import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "DocGen - Professional Document Generator",
  description: "Generate professional PDF document templates quickly and easily. Create letters of recommendation, employment letters, business documents, and more with AI-powered assistance.",
  keywords: ["document generator", "PDF generator", "letter templates", "business documents", "document templates", "professional letters", "employment letters", "recommendation letters", "AI writing assistant"],
  authors: [{ name: "DocGen" }],
  creator: "DocGen",
  publisher: "DocGen",
  applicationName: "DocGen",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DocGen",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docgen.app",
    title: "DocGen - Professional Document Generator",
    description: "Create professional business documents, letters, and templates in minutes with AI assistance.",
    siteName: "DocGen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocGen - Professional Document Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocGen - Document Generator",
    description: "Generate professional PDF documents in minutes with AI",
    images: ["/og-image.png"],
  },
  category: "productivity",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f12" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

