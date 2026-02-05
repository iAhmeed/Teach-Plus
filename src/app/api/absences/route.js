import { database } from "@/lib/mysql"
import { NextResponse } from "next/server";  

export async function GET(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const {searchParams} = new URL(req.url)
        if (!searchParams.get("teacherId")) {
            const searchQuery = `SELECT A.absence_id, A.teacher_id, A.session_id, A.date, A.caught_up, A.reason, A.notes, A.created_at, A.updated_at
            FROM Absences A
            JOIN Teachers T ON A.teacher_id = T.teacher_id
            JOIN Admins D ON T.admin_id = D.admin_id
            WHERE D.admin_id = ?;
            `
            const [absences] = await database.execute(searchQuery, [authorizedAdminId])
            if (!absences.length) {
                return Response.json({status : "FAILED", message : "No absences found !"}, {status : 404})
            }
            return Response.json({status : "SUCCESS", message : "Absences found successfully !", absences : absences}, {status : 200})
        } else {
            const teacherId = searchParams.get("teacherId")
            const [adminOfTeacher] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId])
            if (!adminOfTeacher.length) {
                return Response.json({status : "FAILED", message : "Teacher doesn't exist or his admin is unknown !"}, {status : 404})
            }
            if (adminOfTeacher[0].admin_id != authorizedAdminId) {
                return Response.json({status : "FAILED", message : "Unauthorized ! This teacher doesn't belong to this admin"}, {status : 401})
            }
            const [absences] = await database.execute("SELECT * FROM Absences WHERE teacher_id = ?", [teacherId])
            return Response.json({status : "SUCCESS", message : "Absences found successfully !", absences : absences}, {status : 200})
        }
    } catch(err) {
        return Response.json({status : "FAILED", message : err.message}, {status : 500})
    }
}


// 📌 Marquer une absence (POST)
export async function POST(req) {
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

        const { teacherId, sessionId, date, notes, reason } = body;
        if (!teacherId || !sessionId || !date) {
            return NextResponse.json({ message: "teacherId et sessionId et date sont requis" }, { status: 400 });
        }
        //special case 1 : if the entered teacher doesn't belong to this admin : 
        const [adminOfTeacher] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId])
        if (!adminOfTeacher.length) {
            return Response.json({status : "FAILED", message : "Teacher doesn't exist or his admin is unknown !"}, {status : 404})
        }
        if (adminOfTeacher[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! this teacher doesn't belong to this admin !"}, {status : 401})
        }
        //special case 2 : if the entered session doesn't belong to this admin : 
        const [adminOfSession] = await database.execute("SELECT admin_id FROM Sessions WHERE session_id = ?", [sessionId])
        if (!adminOfSession.length) {
            return Response.json({status : "FAILED", message : "Session doesn't exist or its admin is unknown !"}, {status : 404})
        }
        if (adminOfSession[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! this session doesn't belong to this admin"}, {status : 401})
        }
        //special case 3 : if the entered session belongs to another teacher rather than the entered teacher
        const [teacherOfSession] = await database.execute("SELECT teacher_id FROM Sessions WHERE session_id = ?", [sessionId])
        if (!teacherOfSession.length) {
            return Response.json({status : "FAILED", message : "Session doesn't exist or its teacher is unknown !"}, {status : 404})
        }
        if (teacherOfSession[0].teacher_id != teacherId) {
            return Response.json({status : "FAILED", message : "This session dosn't belong to this teacher !"}, {status : 400})
        }
        const query = `INSERT INTO Absences (teacher_id, session_id, date, notes, reason, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
        const values = [teacherId, sessionId, date,  notes || "", reason || ""];

        const [result] = await database.execute(query, values);
        return NextResponse.json({ message: "Absence enregistrée avec succès", absenceId: result.insertId }, { status: 201 });

    } catch (error) {
        console.error("Erreur markAbsence:", error);
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}
