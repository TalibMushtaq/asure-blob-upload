import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const validUser = process.env.AUTH_USER;
    const validPass = process.env.AUTH_PASS;
    if (!validUser || !validPass) {
      return NextResponse.json({ error: "Server misconfigured: AUTH_USER and AUTH_PASS must be set" }, { status: 500 });
    }

    if (username !== validUser || password !== validPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken(username);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
