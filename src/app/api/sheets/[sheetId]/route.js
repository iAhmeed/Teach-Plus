import { prisma } from "@/lib/prisma";
import { generateDatedSessions, getExtraSessions, groupSessionsByDate } from "@/lib/calculate"

export async function PUT(req, { params }) {
    try {
        const { sheetId } = await params
        const { from, to, teacherId, academicYear, rankPrice, rank } = await req.json();

        if (!from || !to || !teacherId || !academicYear || !rank) {
            return Response.json({ status: "FAILED", message: "A required data field is missing" }, { status: 400 })
        }

        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: Number(teacherId) }
        });

        if (!teacher) {
            return Response.json({ status: "FAILED", message: "Teacher not found" }, { status: 404 })
        }

        const sheet = await prisma.extraHoursSheet.findUnique({
            where: { sheet_id: Number(sheetId) }
        });

        if (!sheet) {
            return Response.json({ status: "FAILED", message: "Sheet not found" }, { status: 404 })
        }

        const toDate = new Date(to)
        let semester
        if ([9, 10, 11, 12, 1].includes(toDate.getMonth() + 1)) {
            semester = "S1"
        }
        else {
            semester = "S2"
        }

        const teacherTimetable = await prisma.session.findMany({
            where: {
                teacher_id: Number(teacherId),
                academic_year: academicYear,
                semester: semester
            }
        });

        const holidays = await prisma.holiday.findMany({
            where: { academic_year: academicYear }
        });

        const absences = await prisma.absence.findMany({
            where: { teacher_id: Number(teacherId) }
        });

        const extraSessions = getExtraSessions(teacherTimetable, teacher.type, teacher.hours_outside)
        const datedExtraSessions = generateDatedSessions(new Date(from), new Date(to), extraSessions, holidays, absences)

        let sheetTotalHours = 0
        const groupedSessions = groupSessionsByDate(datedExtraSessions);
        groupedSessions.forEach(day => {
            sheetTotalHours += day.totalDuration;
        });

        // Update transaction
        const result = await prisma.$transaction(async (tx) => {
            // Delete old extra days
            await tx.extraDay.deleteMany({
                where: { sheet_id: Number(sheetId) }
            });

            // Create new extra days
            // We can't use createMany easily if we need IDs back, but here we just return them.
            // createMany is supported in MySQL.
            // But we need to construct objects properly.

            // Or loop create if not supported or needing IDs.
            // Let's use loop for safety and ID return if needed, or createMany if we refetch.
            // Actually, we can just fetch them after creation.

            // Let's create extra days attached to nothing? No, attached to sheet.
            // But sheet exists.

            // We can update the sheet and create days.

            await tx.extraHoursSheet.update({
                where: { sheet_id: Number(sheetId) },
                data: {
                    from: new Date(from),
                    to: new Date(to),
                    rank: rank,
                    rank_price: Number(rankPrice),
                    extra_hours_number: sheetTotalHours,
                    amount_of_money: sheetTotalHours * Number(rankPrice)
                }
            });

            // Create days
            for (const day of groupedSessions) {
                await tx.extraDay.create({
                    data: {
                        sheet_id: Number(sheetId),
                        day: day.day_of_week,
                        date: new Date(day.date),
                        number_of_hours: day.totalDuration
                    }
                });
            }

            // Fetch updated sheet and days to return
            const updatedSheet = await tx.extraHoursSheet.findUnique({ where: { sheet_id: Number(sheetId) } });
            const updatedDays = await tx.extraDay.findMany({ where: { sheet_id: Number(sheetId) } });

            return { sheet: updatedSheet, extraDays: updatedDays };
        });

        return Response.json({ status: "SUCCESS", message: "Successfully calculated extra hours !", sheet: result.sheet, extraDays: result.extraDays }, { status: 200 })
    } catch (err) {
        console.error(err);
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}
