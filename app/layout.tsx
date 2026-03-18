import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { NetworkGuard } from "@/components/NetworkGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoundYO — Turn spare change into onchain yield",
  description:
    "RoundYO rounds up your purchases and deposits the spare change into live YO vaults, earning real DeFi yield.",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a14] text-white antialiased`}>
        <Providers>
          <Navbar />
          <NetworkGuard />
          {children}
        </Providers>
      </body>
    </html>
  );
}
