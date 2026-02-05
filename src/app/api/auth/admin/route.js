import { NextResponse } from "next/server";

export function GET(req) {
  const adminId = req.headers.get("x-admin-id");
  const sessionExpiresIn = req.headers.get("x-session-expires-in");

  return NextResponse.json({ adminId, sessionExpiresIn });
}
