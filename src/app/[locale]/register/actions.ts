"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function authenticateAfterRegister(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return "فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول يدوياً.";
    }
    console.error("Auto-login after register error:", error);
    return "حدث خطأ. يرجى تسجيل الدخول يدوياً.";
  }
}
