// Temporary dev-only "auth".
// Replace later with Clerk/NextAuth.
export async function getDevUser() {
    return {
      id: "dev-user",
      email: "dev@example.com",
    };
  }
  