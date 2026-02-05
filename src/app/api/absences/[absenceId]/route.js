import { database } from "@/lib/mysql"
import { NextResponse } from "next/server"
export async function DELETE(req, {params}) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const {absenceId} = await params
        const searchQuery = `SELECT D.admin_id
        FROM Absences A
        JOIN Teachers T ON A.teacher_id = T.teacher_id
        JOIN Admins D ON T.admin_id = D.admin_id
        WHERE A.absence_id = ?
        `
        const [adminOfAbsence] = await database.execute(searchQuery, [absenceId])
        if (!adminOfAbsence.length) {
            return Response.json({status : "FAILED", message : "Absence doesn't exist or its admin is unknown !"}, {status : 400})
        }
        if (adminOfAbsence[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! this absence doesn't belong to this admin"}, {status : 401})
        }
        await database.execute("DELETE FROM Absences WHERE absence_id = ?", [absenceId])
        return Response.json({status : "SUCCESS", message : "Absence deleted successfully !"}, {status : 200})
    } catch(err) {
        return Response.json({status : "FAILED", message : err.message}, {status : 500})
    }
}

// 📌 Mettre à jour une absence (PATCH)
export async function PATCH(req, {params}) {
    try {
        // Vérifier si le `Content-Type` est JSON
        const contentType = req.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            return NextResponse.json({ message: "Content-Type doit être application/json" }, { status: 400 });
        }
        const authorizedAdminId = req.headers.get("x-admin-id")
        let body;
        try {
            body = await req.json();
        } catch (error) {
            return NextResponse.json({ message: "JSON invalide" }, { status: 400 });
        }

        let { teacherId, sessionId, date, notes, reason } = body;
        const {absenceId} = await params
        const [absence] = await database.execute("SELECT * FROM Absences WHERE absence_id = ?", [absenceId])

        if (!absenceId) {
            return NextResponse.json({ message: "ID de l'absence requis" }, { status: 400 });
        }
        if (!absence.length) {
            return NextResponse.json({status : "FAILED", message : "Absence not found !"}, {status : 404})
        }
        teacherId = teacherId || absence[0].teacher_id
        if (!sessionId || !date) {
            return NextResponse.json({ message: "teacherId et sessionId et date sont requis" }, { status: 400 });
        }

        //special case 1 : if this absence doesn't belong to this admin : 
        const searchQuery = `SELECT D.admin_id 
        FROM Absences A 
        JOIN Teachers T ON A.teacher_id = T.teacher_id
        JOIN Admins D ON T.admin_id = D.admin_id
        WHERE A.absence_id = ?
        `
        const [adminOfAbsence] = await database.execute(searchQuery,[absenceId])
        if (!adminOfAbsence.length) {
            return Response.json({status : "FAILED", message : "Absence not found or its admin is unknown !"}, {status : 404})
        }
        if (adminOfAbsence[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! This absence doesn't belong to this admin"}, {status : 401})
        }

        //special case 2 : if the entered teacher doesn't belong to this admin : 
        const [adminOfTeacher] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!adminOfTeacher.length) {
            return Response.json({status : "FAILED", message : "Teacher doesn't exist or his admin is unknown !"}, {status : 404})
        }
        if (adminOfTeacher[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! this teacher doesn't belong to this admin !"}, {status : 401})
        }
        //special case 3 : if the entered session doesn't belong to this admin : 
        const [adminOfSession] = await database.execute("SELECT admin_id FROM Sessions WHERE session_id = ?", [sessionId])
        if (!adminOfSession.length) {
            return Response.json({status : "FAILED", message : "Session doesn't exist or its admin is unknown !"}, {status : 404})
        }
        if (adminOfSession[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! this session doesn't belong to this admin"}, {status : 401})
        }
        //special case 4 : if the entered session belongs to another teacher rather than the entered teacher
        const [teacherOfSession] = await database.execute("SELECT teacher_id FROM Sessions WHERE session_id = ?", [sessionId])
        if (!teacherOfSession.length) {
            return Response.json({status : "FAILED", message : "Session doesn't exist or its teacher is unknown !"}, {status : 404})
        }
        if (teacherOfSession[0].teacher_id != teacherId) {
            return Response.json({status : "FAILED", message : "This session dosn't belong to this teacher !"}, {status : 400})
        }

        const query = `UPDATE Absences SET teacher_id = ?, session_id = ?, date = ?, notes = ?, reason = ?, updated_at = NOW() WHERE absence_id = ?`;
        const values = [teacherId, sessionId, date,  notes || "", reason || "", absenceId];

        const [result] = await database.execute(query, values);
        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "Absence non trouvée" }, { status: 404 });
        }

        return NextResponse.json({ message: "Absence mise à jour avec succès" }, { status: 200 });

    } catch (error) {
        console.error("Erreur updateAbsence:", error);
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}

