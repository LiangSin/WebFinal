import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const config = {
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
      if (email.endsWith("@g.ntu.edu.tw")) return true;
      return false;
    },
  },
} satisfies NextAuthConfig;

export default config;


