import { database } from "@/lib/mysql"

export async function DELETE(req, { params }) {
    try {
        const { sessionId } = await params
        const authorizedAdminId = req.headers.get("x-admin-id")
        const [adminOfSession] = await database.execute("SELECT admin_id FROM Sessions WHERE session_id = ?", [sessionId])
        if (!adminOfSession.length) {
            return Response.json({ status: "FAILED", message: "Session doesn't exist or its admin is unknown !" }, { status: 404 })
        }
        if (adminOfSession[0].admin_id != authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! can't delete a session that doesn't belong to you" }, { status: 401 })
        }
        if (!sessionId) {
            return Response.json({ status: "FAILED", message: "Session ID is required!" }, { status: 400 });
        }
        await database.execute("DELETE FROM Absences WHERE session_id = ?", [sessionId])
        await database.execute("DELETE FROM Sessions WHERE session_id = ?", [sessionId])
        return Response.json({ status: "SUCESS", message: "Session deleted successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function PUT(req, { params }) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { sessionId } = await params


        const [session] = await database.execute("SELECT * FROM Sessions WHERE session_id = ?", [sessionId])
        if (!session.length) {
            return Response.json({ status: "FAILED", message: "Session not found !" }, { status: 404 })
        }
        if (session[0].admin_id != authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! can't update a session that doesn't belong to you !" }, { status: 401 })
        }

        const { teacherId, dayOfWeek, startTime, endTime, type, classroom, module, groupNumber, academicYear, academicLevel, semester, action } = await req.json()
        const [adminOfTeacher] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!adminOfTeacher.length) {
            return Response.json({ status: "FAILED", message: "There is no teacher with this id !" }, { status: 400 })
        }
        if (adminOfTeacher[0].admin_id != authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This teacher doesn't belong to this admin" }, { status: 401 })
        }
        if (action == "1") {
            await database.execute("DELETE FROM Absences WHERE session_id = ?", [sessionId])
        } else if (action == "2") {
            await database.execute("UPDATE Absences SET teacher_id = ? WHERE session_id = ?", [teacherId, sessionId])
        }
        const updateQuery = `UPDATE Sessions
        SET teacher_id = ?, day_of_week = ?, start_time = ?, end_time = ?, type = ?, module = ?, classroom = ?, group_number = ?, academic_year = ?, academic_level = ?, semester = ?
        WHERE session_id = ?
        `
        const updateValues = [teacherId || session[0].teacher_id, dayOfWeek || session[0].day_of_week, startTime || session[0].start_time, endTime || session[0].end_time, type || session[0].type, module || session[0].module, classroom || session[0].classroom, groupNumber || session[0].group_number, academicYear || session[0].academic_year, academicLevel || session[0].academic_level, semester || session[0].semester, sessionId]
        await database.execute(updateQuery, updateValues)
        return Response.json({ status: "SUCCESS", message: "Session updated successfully !" }, { status: 200 })

    } catch (err) {

        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}