import { database } from "@/lib/mysql"

export async function GET(req, { params }) {
    try {
        const { teacherId } = await params
        if (teacherId === undefined || teacherId === "") {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }
        const authorizedAdminId = req.headers.get("x-admin-id")
        const [adminOfTeacher] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!adminOfTeacher.length) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
        }
        if (adminOfTeacher[0].admin_id != authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This teacher doesn't belong to this admin" }, { status: 401 })
        }
        const [ranks] = await database.execute("SELECT * FROM Ranks_of_teachers WHERE teacher_id = ?", [teacherId])
        return Response.json({ status: "SUCCESS", message: "Ranks found successfully !", ranksHistory: ranks }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}