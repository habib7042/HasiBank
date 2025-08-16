import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HASHI BANK - We save for the future",
  description: "Personal savings tracking app for Shobuj and Shitu. Track your monthly deposits and watch your savings grow with HASHI BANK.",
  keywords: ["HASHI BANK", "savings", "finance", "personal banking", "money tracking", "deposits"],
  authors: [{ name: "HASHI BANK Team" }],
  openGraph: {
    title: "HASHI BANK - We save for the future",
    description: "Personal savings tracking app for Shobuj and Shitu",
    url: "http://localhost:3000",
    siteName: "HASHI BANK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HASHI BANK - We save for the future",
    description: "Personal savings tracking app for Shobuj and Shitu",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HASHI BANK",
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#ffffff",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "HASHI BANK",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon-180x180.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HASHI BANK" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }

              // PWA Installation Prompt
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // Show install button after a delay
                setTimeout(() => {
                  showInstallButton();
                }, 3000);
              });

              function showInstallButton() {
                const installButton = document.createElement('div');
                installButton.id = 'pwa-install-banner';
                installButton.innerHTML = \`
                  <div style="
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #06b6d4, #3b82f6);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                  " onclick="installPWA()">
                    📱 Install HASHI BANK App
                  </div>
                \`;
                document.body.appendChild(installButton);
              }

              function installPWA() {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                    document.getElementById('pwa-install-banner')?.remove();
                  });
                }
              }

              // Hide install button if app is already installed
              window.addEventListener('appinstalled', (evt) => {
                console.log('HASHI BANK was installed');
                document.getElementById('pwa-install-banner')?.remove();
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
