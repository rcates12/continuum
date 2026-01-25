// sign out page - redirect to home page
import { redirect } from "next/navigation";

export default function SignOutPage() {
  redirect("/");
}
