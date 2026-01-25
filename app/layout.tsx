import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Silk from "./habits/Silk";
import { ClerkProvider, SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';


const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
        className={`${jetbrainsMono.variable} font-mono antialiased px-4 h-[100dvh] overflow-hidden`}
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
        <SignedOut>
          <header>
            <div className="flex flex-col gap-4 sm:flex-row p-4">
              <SignInButton>
                <a href="/sign-in" className="glass-btn bg-ocean flex items-center justify-center rounded-xl px-4 py-2 text-teal font-medium transition-colors hover:bg-ocean/90 cursor-pointer">
                  Login
                </a>
              </SignInButton>
              <SignUpButton>
                <a href="/sign-up" className="glass-btn bg-gold flex items-center justify-center rounded-xl px-4 py-2 text-teal font-medium transition-colors hover:bg-gold/90 cursor-pointer">
                  Sign Up
                </a>
              </SignUpButton>
            </div>
          </header>
        </SignedOut>
        {children}
      </body> 
      </ClerkProvider>
    </html>
  );
}
