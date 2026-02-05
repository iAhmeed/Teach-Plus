import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/mysql";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const { token, newPassword } = await req.json();
        if (!token || !newPassword) {
            return NextResponse.json({ status: "FAILED", message: "Token and new password are required" }, { status: 400 });
        }

        const [rows]: any = await database.execute(
            "SELECT email FROM Password_resets WHERE token = ? AND expires_at > NOW()",
            [token]
        );

        if (rows.length === 0) {
            return NextResponse.json({ status: "FAILED", message: "Invalid or expired token" }, { status: 400 });
        }

        const email = rows[0].email;
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await database.execute("UPDATE Admins SET password_hash = ? WHERE email = ?", [hashedPassword, email]);
        await database.execute("DELETE FROM Password_resets WHERE email = ?", [email]);

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

        const [rows]: any = await database.execute(
            "SELECT password_hash FROM Admins WHERE admin_id = ?",
            [authorizedAdminId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ status: "FAILED", message: "Admin not found !" }, { status: 404 });
        }

        const storedPasswordHash = rows[0].password_hash;
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

        await database.execute(
            "UPDATE Admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?",
            [newHashedPassword, authorizedAdminId]
        );

        return NextResponse.json({ status: "SUCCESS", message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ status: "FAILED", message: error.message }, { status: 500 });
    }
}
