import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ status: "FAILED", message: "Email is required" }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { email: email }
        });

        if (!admin) {
            return NextResponse.json({ status: "FAILED", message: "Email not found" }, { status: 404 });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await prisma.passwordReset.create({
            data: {
                email: email,
                token: token,
                expires_at: expiresAt
            }
        });

        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        await sendResetEmail(email, resetLink);

        return NextResponse.json({ status: "SUCCESS", message: "Reset link sent" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

async function sendResetEmail(email: string, resetLink: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const templatePath = path.join(process.cwd(), "src/app/api/auth/forgot-password/password_reset_email.html");
    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders
    htmlContent = htmlContent.replace("${resetLink}", resetLink);
    htmlContent = htmlContent.replace("${new Date().getFullYear()}", new Date().getFullYear().toString());

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: htmlContent,
    });
}
