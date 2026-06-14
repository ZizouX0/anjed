import type { Metadata, Viewport } from "next";
// Design system (produit par l'agent design) — l'ordre d'import est important.
import "../styles/tokens.css";
import "../styles/moods.css";
import "../styles/components.css";
import "./globals.css";
import { AppProvider } from "./providers";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Anjed's Closet",
  description: "Essaie tes tenues comme par magie ✨",
  manifest: "/manifest.webmanifest",
  applicationName: "Anjed's Closet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anjed's Closet",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#d9849a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-mood="romantic">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <main className="app-main">{children}</main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
