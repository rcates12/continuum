import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const user = await currentUser();
  return {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? "",
  };
}
  