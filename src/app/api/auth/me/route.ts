import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    account_id: payload.account_id,
  });
}
