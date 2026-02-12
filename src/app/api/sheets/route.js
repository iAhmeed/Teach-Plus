import { prisma } from "@/lib/prisma";
import { generateDatedSessions, getExtraSessions, groupSessionsByDate } from "@/lib/calculate"

export async function POST(req) {
    try {
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

        const sheet = await prisma.extraHoursSheet.findFirst({
            where: {
                teacher_id: Number(teacherId),
                from: new Date(from),
                to: new Date(to)
            }
        });

        if (sheet) {
            const extraDays = await prisma.extraDay.findMany({
                where: { sheet_id: sheet.sheet_id }
            });
            return Response.json({ status: "EXISTS", message: "Sheet already exists", sheet: sheet, extraDays: extraDays }, { status: 200 })
        }
        else {
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

            // Calculate total hours
            const groupedSessions = groupSessionsByDate(datedExtraSessions);
            groupedSessions.forEach(day => {
                sheetTotalHours += day.totalDuration;
            });

            // Create sheet and extra days in one go
            const sheetResult = await prisma.extraHoursSheet.create({
                data: {
                    teacher_id: Number(teacherId),
                    from: new Date(from),
                    to: new Date(to),
                    rank: rank,
                    rank_price: Number(rankPrice),
                    extra_hours_number: sheetTotalHours,
                    amount_of_money: sheetTotalHours * Number(rankPrice),
                    extra_days: {
                        create: groupedSessions.map(day => ({
                            day: day.day_of_week,
                            date: new Date(day.date),
                            number_of_hours: day.totalDuration
                        }))
                    }
                },
                include: {
                    extra_days: true
                }
            });

            return Response.json({
                status: "SUCCESS",
                message: "Successfully calculated extra hours !",
                sheet: {
                    sheet_id: sheetResult.sheet_id,
                    from: from,
                    to: to,
                    rank: rank,
                    rank_price: rankPrice,
                    extra_hours_number: sheetTotalHours,
                    amount_of_money: sheetTotalHours * rankPrice,
                    teacher_id: teacherId
                },
                extraDays: sheetResult.extra_days
            }, { status: 200 })
        }
    } catch (err) {
        console.error(err);
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}
