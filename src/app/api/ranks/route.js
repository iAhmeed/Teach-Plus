import { database } from "@/lib/mysql"

export async function POST(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { teacherId, startingDate, rank } = await req.json()
        if ([teacherId, startingDate, rank].some((data) => data === undefined || data === "")) {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }
        const [adminOfTeacher] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!adminOfTeacher.length) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
        }
        if (adminOfTeacher[0].admin_id != authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This teacher doesn't belong to this admin" }, { status: 401 })
        }
        await database.execute("INSERT INTO Ranks_of_teachers(teacher_id, starting_date, rank, created_at) VALUES (?, ?, ?, NOW())", [teacherId, startingDate, rank])
        return Response.json({ status: "SUCCESS", message: "Rank added successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}
