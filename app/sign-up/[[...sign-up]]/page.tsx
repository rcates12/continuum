import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/habits");
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-12 py-32 px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Sign Up
          </h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Create an account to get started.
          </p>
        </div>
        <SignUp />
      </main>
    </div>
  );
}

