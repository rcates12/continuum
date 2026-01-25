import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/habits");
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-12 py-32 px-8 text-center">
        <SignIn />
      </main>
    </div>
  );
}