import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("请先登录");
  }
  return user;
}

export async function requireRole(roles: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("请先登录");
  }
  if (!roles.includes(user.role as string)) {
    throw new Error("权限不足");
  }
  return user;
}
