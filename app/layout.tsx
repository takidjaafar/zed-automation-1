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
  icons: {
    icon: "/favicon.svg",
  },
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
      <head suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=Object.getOwnPropertyDescriptor(window,'fetch');if(!d||d.configurable){var _f=window.fetch;Object.defineProperty(window,'fetch',{configurable:true,enumerable:true,get:function(){return _f;},set:function(v){_f=v;}});}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} bg-[#05080F] text-slate-100 antialiased selection:bg-emerald-500/25 selection:text-emerald-200`}
      >
        {children}
      </body>
    </html>
  );
}
