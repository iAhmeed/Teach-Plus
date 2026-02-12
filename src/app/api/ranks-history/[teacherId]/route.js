import { prisma } from "@/lib/prisma"

export async function GET(req, { params }) {
    try {
        const { teacherId } = await params
        if (teacherId === undefined || teacherId === "") {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }
        const authorizedAdminId = req.headers.get("x-admin-id")

        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: Number(teacherId) },
            select: { admin_id: true }
        });

        if (!teacher) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
        }
        if (teacher.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This teacher doesn't belong to this admin" }, { status: 401 })
        }

        const ranks = await prisma.ranksOfTeacher.findMany({
            where: { teacher_id: Number(teacherId) }
        });

        return Response.json({ status: "SUCCESS", message: "Ranks found successfully !", ranksHistory: ranks }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}