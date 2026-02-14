import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ERPDataProvider } from "@/context/ERPDataContext";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Attendance75 - College Attendance Calculator & Tracker",
    template: "%s | Attendance75",
  },
  description:
    "Free college attendance calculator. Track attendance %, plan how many classes to attend, check if you can skip today. Works offline. No login required.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Attendance75",
  },
  applicationName: "Attendance75",
  keywords: ["attendance calculator", "college attendance", "75 percent attendance", "attendance tracker", "can i skip class"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Attendance75",
    title: "Attendance75 - College Attendance Calculator",
    description: "Track & plan your college attendance. Know if you can skip today.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3359889042531313"
            crossOrigin="anonymous"
          />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ERPDataProvider>
              {children}
              <Toaster position="top-center" richColors />
              <ServiceWorkerRegistrar />
            </ERPDataProvider>
          </AuthProvider>
        </ThemeProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
