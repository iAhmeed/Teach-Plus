import { database } from "@/lib/mysql"
function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
export async function POST(req) {
    try {
        const { from, to, name } = await req.json()
        if ([from, to].some((data) => !data)) {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }
        const [periods] = await database.execute("SELECT `from`, `to` FROM Periods")
        for (let period of periods) {
            if (isSameDay(new Date(period.from), new Date(from)) && isSameDay(new Date(period.to), new Date(to))) {
                return Response.json({ status: "FAILED", message: "This period already exists !" }, { status: 409 })
            }
        }
        await database.execute("INSERT INTO Periods(`from`, `to`, name) VALUES (?, ?, ?)", [from, to, name || null])
        return Response.json({ status: "SUCCESS", message: "Period added successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const [periods] = await database.execute("SELECT * FROM Periods")
        if (!periods.length) {
            return Response.json({ status: "FAILED", message: "No periods found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Periods found successfully !", periods: periods }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}