import { NextResponse } from "next/server";

// This endpoint clears all stale auth cookies to fix redirect loops
export async function GET() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXTAUTH_URL || "https://doctornafsyonline.com"),
    { status: 302 }
  );

  // Clear ALL possible NextAuth cookie variations (old and new)
  const cookiesToClear = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
  ];

  for (const name of cookiesToClear) {
    // Clear with domain
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
