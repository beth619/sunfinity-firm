import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import NewsletterPopup from "@/app/components/Newsletter/NewsletterPopup";
import { createClient } from "@/app/utils/supabase/server";
import { getAppUser } from "@/app/utils/get-app-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SunFinity Firm",
  description: "Books, essays, and frameworks for builders.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const appUser = await getAppUser(supabase);
  const isLoggedIn = !!appUser;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-primary-navy dark:text-white">
        {/* Only pass isLoggedIn since Navbar now manages its own dark mode state internally */}
        <Navbar isLoggedIn={isLoggedIn} />
        <div className="flex-1">{children}</div>
        <Footer />
        <NewsletterPopup />
      </body>
    </html>
  );
}