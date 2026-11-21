import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans, Inter } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zedautomations.tech"),
  title: "Zed Automation - Real Estate Commission Audit",
  description:
    "Forensic real estate commission audit and GCI leakage recovery for US managing brokers. Detect split drift, uncollected referral fees, and waived admin fees in 48 hours—100% written and async.",
  keywords: [
    "forensic commission audit",
    "real estate commission audit",
    "brokerage GCI recovery",
    "commission leakage detection",
    "agent split drift audit",
    "uncollected referral fee recovery",
    "closing disclosure reconciliation",
    "ALTA settlement statement audit",
    "real estate brokerage margin audit",
    "Zed Automation",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://zedautomations.tech",
    siteName: "Zed Automation",
    title: "Zed Automation - Real Estate Commission Audit",
    description:
      "Forensic real estate commission audit and GCI leakage recovery for US managing brokers. 48-hour written PDF, CSV, and Loom delivery with zero calls.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zed Automation - Real Estate Commission Audit",
    description:
      "Detect agent split drift, uncollected referral fees, and waived compliance charges in 48 hours—100% written and asynchronous.",
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
        className={`${instrumentSans.variable} ${inter.variable} ${geistMono.variable} bg-[#040807] font-sans text-slate-100 antialiased selection:bg-emerald-500/25 selection:text-emerald-200`}
      >
        <div
          aria-hidden="true"
          className="fintech-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.025]"
        />
        {children}
      </body>
    </html>
  );
}
