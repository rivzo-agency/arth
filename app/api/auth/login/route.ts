import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSession,
  verifyAdminCredentials,
} from "../../../admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { email?: unknown; password?: unknown; remember?: unknown };
    const email = typeof payload.email === "string" ? payload.email : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const user = verifyAdminCredentials(email, password);

    if (!user) {
      const configured = Boolean(
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_PASSWORD &&
        (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32,
      );
      return NextResponse.json(
        { error: configured ? "Incorrect email or password." : "Admin login is not configured. Complete .env.local first." },
        { status: configured ? 401 : 503 },
      );
    }

    const remember = payload.remember === true;
    const session = createAdminSession(user, remember);
    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(ADMIN_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Sign-in could not be completed." }, { status: 400 });
  }
}
