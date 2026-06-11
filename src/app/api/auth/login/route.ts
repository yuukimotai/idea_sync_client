import { NextRequest, NextResponse } from "next/server";

const RUBY_API = process.env.RUBY_API_URL || "http://localhost:2300";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${RUBY_API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const response = NextResponse.json({
    status: data.status,
    account: data.account,
  });

  response.cookies.set("auth_token", data.token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
