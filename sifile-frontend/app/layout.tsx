import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "SiFile — File Tools That Work",
  description: "A premium toolkit for processing images and PDFs. Fast, secure, and beautiful.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
