import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "TENANT" | "LANDLORD" | "ADMIN";
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "TENANT" | "LANDLORD" | "ADMIN";
      isActive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "TENANT" | "LANDLORD" | "ADMIN";
    isActive: boolean;
  }
}
