import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Silk from "./habits/Silk";
import { ClerkProvider } from '@clerk/nextjs';


const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Continuum | Habit Tracker",
  description: "A habit tracker for your life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased px-4 min-h-[100dvh]`}
      >
        {/* Fixed background layer */}
        <Silk 
          className="fixed inset-0 w-full h-full -z-10" 
          speed={3.6} 
          scale={0.8} 
          color="#4d4d4d" 
          noiseIntensity={1.5} 
          rotation={0} 
        />
        {children}
      </body> 
      </ClerkProvider>
    </html>
  );
}
