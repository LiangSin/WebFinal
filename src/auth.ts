import NextAuth from "next-auth";
import authConfig from "./auth.config";

// NextAuth v4: 建立單一 handler，並在 route handler 中 export 成 GET / POST
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

