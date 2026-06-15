import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const RUBY_API = process.env.RUBY_API_URL || "http://localhost:2300";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // role はDBが唯一の真実なので、毎回Rubyの /api/me から取得する。
  // これでロール変更（昇格/降格）が即座に反映される。
  try {
    const res = await fetch(`${RUBY_API}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json({
      authenticated: true,
      account_id: data.account_id,
      email: data.email,
      role: data.role,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
