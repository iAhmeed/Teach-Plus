import { database } from "@/lib/mysql"

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}


export async function POST(req) {
    try {
        const { description, from, to, academicYear } = await req.json()
        if ([description, from, to, academicYear].some((data) => !data)) {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }
        const [holidays] = await database.execute("SELECT `from`, `to` FROM Holidays")
        for (let holiday of holidays) {
            if (isSameDay(new Date(holiday.from), new Date(from)) && isSameDay(new Date(holiday.to), new Date(to))) {
                return Response.json({ status: "FAILED", message: "This holiday already exists !" }, { status: 409 })
            }
        }
        await database.execute("INSERT INTO Holidays(description, `from`, `to`, academic_year) VALUES (?, ?, ?, ?)", [description, from, to, academicYear])
        return Response.json({ status: "SUCCESS", message: "Holiday added successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        
      
        const [holidays] = await database.execute("SELECT * FROM Holidays")
        if (!holidays.length) {
            return Response.json({ status: "FAILED", message: "No holidays found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Holidays found successfully !", holidays: holidays }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}