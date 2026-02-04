import type { Metadata } from "next";
import { Inter } from "next/font/google"; // or local font if default
// If generic app-tw template uses geist, I'll stick to what's there or just use Inter. 
// Assuming default layout.tsx content, I will just overwrite it to be safe and clean.
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HAT",
  description: "Business Management System",
  icons: {
    icon: '/title.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
