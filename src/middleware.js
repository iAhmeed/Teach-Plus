import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";
export default async function middleware(req) {
  try {
    const path = req.nextUrl.pathname;
    const cookie = req.cookies.get("session")?.value;
    if (!cookie) {
      if (path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });

    if (path === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const newExpiry = currentTime + 7 * 24 * 60 * 60;
    const expiresIn = newExpiry - currentTime;

    const newToken = await new SignJWT({ adminId: payload.adminId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(newExpiry)
      .sign(encodedKey);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin-id", payload.adminId);
    requestHeaders.set("x-session-expires-in", expiresIn.toString());

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    response.cookies.set("session", newToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (err) {
    console.error("JWT Middleware Error:", err.message);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/:path*"],
};