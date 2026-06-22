import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Returns the JWT stored in the httpOnly auth_token cookie so browser JS
// can append it as ?token= when opening a WebSocket to the Falcon WS process.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
