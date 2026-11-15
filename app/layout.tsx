import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zed Automation - Real Estate Commission Audit",
  description:
    "Commission audit, leakage detection, and real estate admin dashboard for brokerages.",
  openGraph: {
    title: "Zed Automation - Real Estate Commission Audit",
    description:
      "Commission audit, leakage detection, and real estate admin dashboard for brokerages.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="/favicon.svg" rel="icon" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var _fetch = window.fetch;
                  Object.defineProperty(window, 'fetch', {
                    configurable: true,
                    enumerable: true,
                    get: function() { return _fetch; },
                    set: function(val) { _fetch = val; }
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} bg-[#05080F] text-slate-100 antialiased selection:bg-emerald-500/25 selection:text-emerald-200`}
      >
        {children}
      </body>
    </html>
  );
}
