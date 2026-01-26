import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import AnimatedHome from './components/AnimatedHome';

export default function Home() {
  return (
    <>
      {/* Signed Out View - Original Layout */}
      <SignedOut>
        <div className="flex h-[100dvh] items-center justify-center overflow-hidden">
          <main className="flex flex-col items-center gap-6 py-6 px-4 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-foreground tracking-tight">
                Continuum
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                Build lasting habits. Track your progress. Transform your life.
              </p>
            </div>

            <div className="flex flex-row gap-4">
              <SignInButton>
                <a href="/sign-in" className="glass-btn bg-ocean flex h-12 items-center justify-center rounded-xl px-8 text-teal font-medium transition-colors hover:bg-ocean/90 cursor-pointer">
                  Login
                </a>
              </SignInButton>
              <SignUpButton>
                <a href="/sign-up" className="glass-btn bg-gold flex h-12 items-center justify-center rounded-xl px-8 text-teal font-medium transition-colors hover:bg-gold/90 cursor-pointer">
                  Sign Up
                </a>
              </SignUpButton>
            </div>

            <div className="glass-card p-6 max-w-sm space-y-3">
              <h2 className="text-gold font-semibold">Quick Stats</h2>
              <p className="text-sm text-muted-foreground">
                Start tracking your habits to see your progress here.
              </p>
            </div>
          </main>
        </div>
      </SignedOut>

      {/* Signed In View - Animated Quote Cycler */}
      <SignedIn>
        <AnimatedHome />
      </SignedIn>
    </>
  );
}
