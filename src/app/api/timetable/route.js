import { prisma } from "@/lib/prisma"
export async function GET(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { searchParams } = new URL(req.url)
        const promo = searchParams.get("promo")
        const academicYear = searchParams.get("academicYear")
        const semester = searchParams.get("semester")
        const timetable = await prisma.session.findMany({
            where: {
                academic_level: Number(promo),
                academic_year: academicYear,
                semester: semester,
                admin_id: Number(authorizedAdminId)
            }
        });

        if (!timetable.length) {
            return Response.json({ status: "FAILED", message: "Timetable not found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCESS", message: "Timetable found successfully !", timetable: timetable }, { status: 200 })
    } catch (err) {
        console.log(err)
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}