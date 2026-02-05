import { database } from "@/lib/mysql";
function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export async function PUT(req, { params }) {
    try {
        const { holidayId } = await params;
        const [holiday] = await database.execute("SELECT * FROM Holidays WHERE holiday_id = ?", [holidayId]);
        if (holiday.length === 0) {
            return Response.json({ status: "FAILED", message: "Holiday not found" }, { status: 404 });
        }
        const { newDescription, newFrom, newTo, newAcademicYear } = await req.json();
        const [holidays] = await database.execute("SELECT `from`, `to` FROM Holidays WHERE holiday_id != ?", [holidayId]);
        for (let holiday of holidays) {
            if (isSameDay(new Date(holiday.from), new Date(newFrom)) && isSameDay(new Date(holiday.to), new Date(newTo))) {
                return Response.json({ status: "FAILED", message: "This holiday already exists !" }, { status: 409 })
            }
        }
        const updateQuery = `UPDATE Holidays
        SET description = ?, \`from\` = ?, \`to\` = ?, academic_year = ?
        WHERE holiday_id = ?`;
        await database.execute(updateQuery, [newDescription || holiday[0].description, newFrom || holiday[0].from, newTo || holiday[0].to, newAcademicYear || holiday[0].academic_year, holidayId]);
        return Response.json({ status: "SUCCESS", message: "Holiday updated successfully !" }, { status: 200 });
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { holidayId } = await params;
        const [holiday] = await database.execute("SELECT * FROM Holidays WHERE holiday_id = ?", [holidayId]);
        if (holiday.length === 0) {
            return Response.json({ status: "FAILED", message: "Holiday not found" }, { status: 404 });
        }
        await database.execute("DELETE FROM Holidays WHERE holiday_id = ?", [holidayId]);
        return Response.json({ status: "SUCCESS", message: "Holiday deleted successfully !" }, { status: 200 });
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}