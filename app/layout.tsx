import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
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
  title: "ZED Automation - Forensic Commission Audit for US Real Estate Brokerages",
  description:
    "Forensic GCI verification for US managing brokers. Detect split drift, uncollected referral fees, and ALTA mismatches across every closed side in 48 hours—100% written and async.",
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
    "ZED Automation",
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
    siteName: "ZED Automation",
    title: "ZED Automation - Forensic Commission Audit for US Real Estate Brokerages",
    description:
      "Stop leaking commissions. Recover your GCI in 48 hours with a free 3-deal forensic audit delivered via Executive PDF, Discrepancy CSV, and Private Loom—zero calls.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZED Automation - Forensic Commission Audit for US Real Estate Brokerages",
    description:
      "Forensic GCI verification for managing brokers. Free 3-deal audit delivered in 48h via PDF, CSV, and Loom—100% written, zero calls.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
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
        className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} bg-[#060A08] font-sans text-[#F5F2EB] antialiased selection:bg-[#0B6B4A]/50 selection:text-[#F5F2EB]`}
      >
        <div
          aria-hidden="true"
          className="fintech-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay"
        />
        {children}
      </body>
    </html>
  );
}
