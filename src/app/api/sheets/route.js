import { database } from "@/lib/mysql";
import { generateDatedSessions, getExtraSessions, groupSessionsByDate } from "@/lib/calculate"
export async function POST(req) {
    try {
        const { from, to, teacherId, academicYear, rankPrice, rank } = await req.json();

        if (!from || !to || !teacherId || !academicYear || !rank) {
            return Response.json({ status: "FAILED", message: "A required data field is missing" }, { status: 400 })
        }
        const [teacher] = await database.execute("SELECT * FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!teacher.length) {
            return Response.json({ status: "FAILED", message: "Teacher not found" }, { status: 404 })
        }
        const [sheet] = await database.execute(
            "SELECT * FROM Extra_hours_sheet WHERE teacher_id = ? AND `from` = ? AND `to` = ?",
            [teacherId, from, to]
        );

        if (sheet.length) {
            const [extraDays] = await database.execute("SELECT * FROM Extra_days WHERE sheet_id =? ", [sheet[0].sheet_id])
            return Response.json({ status: "EXISTS", message: "Sheet already exists", sheet: sheet[0], extraDays: extraDays }, { status: 200 })
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
            const [teacherTimetable] = await database.execute("SELECT * FROM Sessions WHERE teacher_id = ? AND academic_year = ? AND semester = ?", [teacherId, academicYear, semester])
            const [holidays] = await database.execute("SELECT * FROM Holidays WHERE academic_year = ?", [academicYear])
            const [absences] = await database.execute("SELECT * FROM Absences WHERE teacher_id = ?", [teacherId])
            const extraSessions = getExtraSessions(teacherTimetable, teacher[0].type, teacher[0].hours_outside)
            const datedExtraSessions = generateDatedSessions(new Date(from), new Date(to), extraSessions, holidays, absences)
            let sheetTotalHours = 0
            let extraDays = []
            for (const day of groupSessionsByDate(datedExtraSessions)) {
                sheetTotalHours += day.totalDuration
                const [extraDayResult] = await database.execute("INSERT INTO Extra_days (day, date, number_of_hours) VALUES (?, ?, ?)", [day.day_of_week, day.date, day.totalDuration])
                extraDays.push({ extra_day_id: extraDayResult.insertId, day: day.day_of_week, date: day.date, number_of_hours: day.totalDuration })
            }

            const [sheetResult] = await database.execute("INSERT INTO Extra_hours_sheet (teacher_id, `from`, `to`, rank, rank_price, extra_hours_number, amount_of_money, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())", [teacherId, from, to, rank, rankPrice, sheetTotalHours, sheetTotalHours * rankPrice])
            for (const day of extraDays) {
                await database.execute("UPDATE Extra_days SET sheet_id = ? WHERE extra_day_id = ?", [sheetResult.insertId, day.extra_day_id])
            }
            return Response.json({ status: "SUCCESS", message: "Successfully calculated extra hours !", sheet: { sheet_id: sheetResult.insertId, from: from, to: to, rank: rank, rank_price: rankPrice, extra_hours_number: sheetTotalHours, amount_of_money: sheetTotalHours * rankPrice, teacher_id: teacherId }, extraDays: extraDays.map((e) => Object.assign({}, e, { sheet_id: sheetResult.insertId })) }, { status: 200 })
        }
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}