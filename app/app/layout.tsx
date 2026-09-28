import type { Metadata } from "next";
import "./globals.css";
import { PwaRegister } from "@/app/components/PwaRegister";

export const metadata: Metadata = {
  title: "SUTRA — Small Business OS",
  description: "Simple sales, stock, collections and business operations for small businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PwaRegister />{children}</body>
    </html>
  );
}