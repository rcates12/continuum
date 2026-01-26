import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/habits");
  }
  return (
    <div className="flex min-h-[100dvh] items-center justify-center py-8 px-4">
      <main className="flex flex-col items-center gap-6 text-center w-full max-w-sm">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-none bg-transparent",
            }
          }}
        />
      </main>
    </div>
  );
}