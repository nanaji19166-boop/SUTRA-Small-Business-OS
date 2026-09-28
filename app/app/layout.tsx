import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUTRA — Small Business OS",
  description: "Simple sales, stock, collections and business operations for small businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}