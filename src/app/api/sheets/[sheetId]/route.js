import { database } from "@/lib/mysql";
import { generateDatedSessions, getExtraSessions, groupSessionsByDate } from "@/lib/calculate"
export async function PUT(req, { params }) {
    try {
        const { sheetId } = await params
        const { from, to, teacherId, academicYear, rankPrice, rank } = await req.json();

        if (!from || !to || !teacherId || !academicYear || !rank) {
            return Response.json({ status: "FAILED", message: "A required data field is missing" }, { status: 400 })
        }
        const [teacher] = await database.execute("SELECT * FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!teacher.length) {
            return Response.json({ status: "FAILED", message: "Teacher not found" }, { status: 404 })
        }
        const [sheet] = await database.execute(
            "SELECT * FROM Extra_hours_sheet WHERE sheet_id = ?",
            [sheetId]
        );
        if (!sheet.length) {
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
        const [teacherTimetable] = await database.execute("SELECT * FROM Sessions WHERE teacher_id = ? AND academic_year = ? AND semester = ?", [teacherId, academicYear, semester])
        const [holidays] = await database.execute("SELECT * FROM Holidays WHERE academic_year = ?", [academicYear])
        const [absences] = await database.execute("SELECT * FROM Absences WHERE teacher_id = ?", [teacherId])
        const extraSessions = getExtraSessions(teacherTimetable, teacher[0].type, teacher[0].hours_outside)
        const datedExtraSessions = generateDatedSessions(new Date(from), new Date(to), extraSessions, holidays, absences)
        let sheetTotalHours = 0
        let extraDays = []
        await database.execute("DELETE FROM Extra_days WHERE sheet_id = ? ", [sheetId])
        for (const day of groupSessionsByDate(datedExtraSessions)) {
            sheetTotalHours += day.totalDuration
            const [extraDayResult] = await database.execute("INSERT INTO Extra_days (day, date, number_of_hours) VALUES (?, ?, ?)", [day.day_of_week, day.date, day.totalDuration])
            extraDays.push({ extra_day_id: extraDayResult.insertId, day: day.day_of_week, date: day.date, number_of_hours: day.totalDuration })
        }

        await database.execute("UPDATE Extra_hours_sheet SET `from` = ?, `to` = ?, rank = ?, rank_price = ?, extra_hours_number = ?, amount_of_money = ? WHERE sheet_id = ?", [from, to, rank, rankPrice, sheetTotalHours, sheetTotalHours * rankPrice, sheetId])
        for (const day of extraDays) {
            await database.execute("UPDATE Extra_days SET sheet_id = ? WHERE extra_day_id = ?", [sheetId, day.extra_day_id])
        }
        return Response.json({ status: "SUCCESS", message: "Successfully calculated extra hours !", sheet: { sheet_id: sheetId, from: from, to: to, rank: rank, rank_price: rankPrice, extra_hours_number: sheetTotalHours, amount_of_money: sheetTotalHours * rankPrice, teacher_id: teacherId }, extraDays: extraDays.map((e) => Object.assign({}, e, { sheet_id: sheetId })) }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}