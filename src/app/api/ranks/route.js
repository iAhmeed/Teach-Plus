import { prisma } from "@/lib/prisma"

export async function POST(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { teacherId, startingDate, rank } = await req.json()

        if ([teacherId, startingDate, rank].some((data) => data === undefined || data === "")) {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }

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

        await prisma.ranksOfTeacher.create({
            data: {
                teacher_id: Number(teacherId),
                starting_date: new Date(startingDate),
                rank: rank
            }
        });

        return Response.json({ status: "SUCCESS", message: "Rank added successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}
