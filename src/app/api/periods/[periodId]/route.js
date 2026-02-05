import { database } from "@/lib/mysql"
function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
export async function PUT(req, { params }) {
    try {
        const { periodId } = await params
        const [period] = await database.execute("SELECT * FROM Periods WHERE period_id = ?", [periodId])
        if (period.length === 0) {
            return Response.json({ status: "FAILED", message: "Period not found" }, { status: 404 })
        }
        const { newName, newFrom, newTo } = await req.json()
        const [periods] = await database.execute("SELECT `from`, `to` FROM Periods WHERE period_id != ?", [periodId])
        for (let period of periods) {
            if (isSameDay(new Date(period.from), new Date(newFrom)) && isSameDay(new Date(period.to), new Date(newTo))) {
                return Response.json({ status: "FAILED", message: "This holiday already exists !" }, { status: 409 })
            }
        }
        const updateQuery = `UPDATE Periods
        SET name = ?, \`from\` = ?, \`to\` = ?
        WHERE period_id = ?`
        await database.execute(updateQuery, [newName || period[0].name, newFrom || period[0].from, newTo || period[0].to, periodId])
        return Response.json({ status: "SUCCESS", message: "Period updated successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const { periodId } = await params
        const [period] = await database.execute("SELECT * FROM Periods WHERE period_id = ?", [periodId])
        if (period.length === 0) {
            return Response.json({ status: "FAILED", message: "Period not found" }, { status: 404 })
        }
        await database.execute("DELETE FROM Periods WHERE period_id = ?", [periodId])
        return Response.json({ status: "SUCCESS", message: "Period deleted successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}