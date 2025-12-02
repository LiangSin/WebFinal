import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/lib/db/operations";

const config: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    /**
     * 僅允許 g.ntu.edu.tw 網域的信箱登入
     */
    async signIn({ user }) {
      const email = user.email ?? "";
      if (!email.endsWith("@g.ntu.edu.tw")) return false;

      try {
        // Check if user exists, if not create one
        const existingUser = await getUserByEmail(email);
        if (!existingUser) {
          await createUser({
            email: email,
            name: user.name || undefined,
            image: user.image || undefined,
          });
        }
        return true;
      } catch (error) {
        console.error("Error checking/creating user in DB:", error);
        // Depending on policy, you might want to return false here or allow sign in but log error
        // For now, let's allow sign in but log the error so the auth flow isn't completely broken if DB is down
        return true; 
      }
    },
  },
};

export default config;
