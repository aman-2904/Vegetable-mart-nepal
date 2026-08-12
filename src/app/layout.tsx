import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getUser } from "@/lib/auth";
import { CartSync } from "@/components/cart/CartSync";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "FreshHarvest | Premium Vegetable Delivery",
    template: "%s | FreshHarvest",
  },
  description: "Order farm-fresh, premium quality vegetables delivered straight to your door. The greenest, freshest produce available online.",
  keywords: ["vegetables", "organic", "fresh delivery", "grocery", "farm fresh"],
  openGraph: {
    title: "FreshHarvest | Premium Vegetable Delivery",
    description: "Order farm-fresh, premium quality vegetables delivered straight to your door.",
    url: "/",
    siteName: "FreshHarvest",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const isAuth = !!user;

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartSync isAuth={isAuth} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
