import { prisma } from "@/lib/prisma"

export async function GET(req, { params }) {
    try {
        const { adminId } = await params

        const admin = await prisma.admin.findUnique({
            where: { admin_id: Number(adminId) }
        });

        if (!admin) {
            return Response.json({ status: "FAILED", message: "Admin not found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Admin found successfully !", admin: admin }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}