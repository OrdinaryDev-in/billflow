import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--bf-font",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Billflow — Quote, bill and get paid",
    template: "%s — Billflow",
  },
  description:
    "The easiest way for Indian software professionals to quote, bill and get paid.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page text-text-primary">
        {children}
      </body>
    </html>
  );
}
