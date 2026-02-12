import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt"
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if ([email, password].some((data) => data === undefined || data === "")) {
      return Response.json({ status: "FAILED", message: "Required data field is missing !" }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email: email
      }
    });

    if (!admin) {
      return Response.json({ status: "FAILED", message: "Admin not found !" }, { status: 404 })
    }

    const hashedPassword = admin.password_hash
    const passwordMatch = await bcrypt.compare(password, hashedPassword)
    if (!passwordMatch) {
      return Response.json({ status: "FAILED", message: "Wrong password !" }, { status: 401 })
    }

    const secretKey = process.env.SESSION_SECRET;
    const encodedKey = new TextEncoder().encode(secretKey);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // token expires after 7 days
    const adminId = admin.admin_id
    const session = await new SignJWT({ adminId, expiresAt }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(encodedKey);

    (await cookies()).set("session", session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt
    })

    return Response.json({ status: "SUCCESS", message: "Logged In successdully !", userData: admin, token: session }, { status: 200 })

  } catch (err) {
    return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
  }
}
