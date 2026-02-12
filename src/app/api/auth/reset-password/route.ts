import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();
        if (!token || !newPassword) {
            return NextResponse.json({ status: "FAILED", message: "Token and new password are required" }, { status: 400 });
        }

        const resetRecord = await prisma.passwordReset.findFirst({
            where: {
                token: token,
                expires_at: { gt: new Date() }
            }
        });

        if (!resetRecord) {
            return NextResponse.json({ status: "FAILED", message: "Invalid or expired token" }, { status: 400 });
        }

        const email = resetRecord.email;
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Using transaction for atomicity
        await prisma.$transaction([
            prisma.admin.update({
                where: { email: email },
                data: { password_hash: hashedPassword }
            }),
            prisma.passwordReset.deleteMany({
                where: { email: email }
            })
        ]);

        return NextResponse.json({ status: "SUCCESS", message: "Password updated successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { currentPassword, newPassword } = await req.json();
        const authorizedAdminId = req.headers.get("x-admin-id")
        if (!authorizedAdminId || !currentPassword || !newPassword) {
            return NextResponse.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { admin_id: Number(authorizedAdminId) }
        });

        if (!admin) {
            return NextResponse.json({ status: "FAILED", message: "Admin not found !" }, { status: 404 });
        }

        const storedPasswordHash = admin.password_hash;
        const isMatch = await bcrypt.compare(currentPassword, storedPasswordHash);
        if (!isMatch) {
            return NextResponse.json({ status: "FAILED", message: "Current password is incorrect" }, { status: 401 });
        }

        // Check if new password is the same as the old one
        const isSamePassword = await bcrypt.compare(newPassword, storedPasswordHash);
        if (isSamePassword) {
            return NextResponse.json({ status: "FAILED", message: "New password must be different from the current password" }, { status: 400 });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.admin.update({
            where: { admin_id: Number(authorizedAdminId) },
            data: {
                password_hash: newHashedPassword,
                updated_at: new Date()
            }
        });

        return NextResponse.json({ status: "SUCCESS", message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ status: "FAILED", message: error.message }, { status: 500 });
    }
}
