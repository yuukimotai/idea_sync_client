import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const RUBY_API = process.env.RUBY_API_URL || "http://localhost:2300";

async function proxyRequest(req: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const targetPath = "/" + path.join("/");
  const search = req.nextUrl.search;
  const url = `${RUBY_API}${targetPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body =
    req.method !== "GET"
      ? await req.text() || undefined
      : undefined;

  const res = await fetch(url, { method: req.method, headers, body });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, (await params).path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, (await params).path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, (await params).path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, (await params).path);
}
