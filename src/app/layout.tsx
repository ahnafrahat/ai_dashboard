import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Model Usage Analytics Dashboard",
  description: "AI model performance monitoring and analytics dashboard built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <div className="font-semibold text-gray-900">HelloShop AI</div>
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <Link className="text-gray-700 hover:text-gray-900" href="/image-similarity">
                    Image Similarity Search
                  </Link>
                </li>
                <li>
                  <Link className="text-gray-700 hover:text-gray-900" href="/image-segmentation">
                    Image Segmentation
                  </Link>
                </li>
                <li>
                  <Link className="text-gray-700 hover:text-gray-900" href="/image-gallery">
                    Image Gallery
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
