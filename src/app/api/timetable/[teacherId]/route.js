import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) { // 🔹 Utiliser { params }
    const { teacherId } = await params; // ✅ Correction ici
    const { searchParams } = new URL(req.url);

    if (!teacherId) {
        return NextResponse.json({ message: "teacherId est requis" }, { status: 400 });
    }
    const academicYear = searchParams.get("academicYear")
    const semester = searchParams.get("semester")

    if (!academicYear || !semester) {
        return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 409 })
    }
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")

        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: Number(teacherId) },
            select: { admin_id: true }
        });

        if (!teacher) {
            return Response.json({ status: "FAILED", message: "Teacher not found or his admin is unknown !" }, { status: 404 })
        }
        if (teacher.admin_id != authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin" }, { status: 401 })
        }

        const rows = await prisma.session.findMany({
            where: {
                teacher_id: Number(teacherId),
                academic_year: academicYear,
                semester: semester
            },
            orderBy: [
                { day_of_week: 'asc' }, // Sorting string days might need custom logic if not ISO, but usually fine or handled in frontend. Original was orderBy day_of_week
                { start_time: 'asc' }
            ]
        });

        return NextResponse.json({ timeTable: rows }, { status: 200 });

    } catch (error) {
        console.error("Prisma Error :", error);
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
