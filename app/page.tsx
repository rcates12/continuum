import Link from "next/link";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-12 py-32 px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Continuum
          </h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Build lasting habits. Track your progress. Transform your life.
          </p>
        </div>


        <div className="flex flex-col gap-4 sm:flex-row">
          <SignedOut>
            <SignInButton>
              <button className="glass-btn bg-ocean flex h-12 items-center justify-center rounded-xl px-8 text-teal font-medium transition-colors hover:bg-ocean/90 cursor-pointer">
                Login
              </button>
            </SignInButton>
            <SignUpButton>
              <a href="/sign-up" className="glass-btn bg-gold flex h-12 items-center justify-center rounded-xl px-8 text-teal font-medium transition-colors hover:bg-gold/90 cursor-pointer">
                Sign Up
              </a>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

            <SignedIn>
              <Link
                href="/habits"
                className="glass-btn flex h-12 items-center justify-center rounded-xl px-8 text-foreground"
              >
                Go to Habits
              </Link>
            </SignedIn>
        </div>

        <div className="glass-card p-6 max-w-sm space-y-3">
          <h2 className="text-gold font-semibold">Quick Stats</h2>
          <p className="text-sm text-muted-foreground">
            Start tracking your habits to see your progress here.
          </p>
        </div>
      </main>
    </div>
  );
}
