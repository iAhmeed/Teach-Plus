import { NextResponse } from "next/server";
import { database } from "@/lib/mysql";

// 📌 Marquer une absence comme rattrapée
export async function PATCH(req, { params }) {
    try {
        const { id } = await params; // ✅ Correction ici : on utilise `params`
        const authorizedAdminId = req.headers.get("x-admin-id")

        if (!id) {
            return NextResponse.json({ message: "ID de l'absence requis" }, { status: 400 });
        }
        //special case 1 : if this absence doesn't belong to this admin : 
        const searchQuery = `SELECT D.admin_id 
        FROM Absences A 
        JOIN Teachers T ON A.teacher_id = T.teacher_id
        JOIN Admins D ON T.admin_id = D.admin_id
        WHERE A.absence_id = ?
        `
        const [adminOfAbsence] = await database.execute(searchQuery,[id])
        if (!adminOfAbsence.length) {
            return Response.json({status : "FAILED", message : "Absence not found or its admin is unknown !"}, {status : 404})
        }
        if (adminOfAbsence[0].admin_id != authorizedAdminId) {
            return Response.json({status : "FAILED", message : "Unauthorized ! This absence doesn't belong to this admin"}, {status : 401})
        }
        const [previousCaughtUp] = await database.execute("SELECT caught_up FROM Absences WHERE absence_id = ?", [id])
        const query = `UPDATE Absences SET caught_up = ?, updated_at = NOW() WHERE absence_id = ?`;
        const [result] = await database.execute(query, [!previousCaughtUp[0].caught_up, id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "Absence non trouvée" }, { status: 404 });
        }

        return NextResponse.json({ message: "Absence marquée comme rattrapée" }, { status: 200 });

    } catch (error) {
        console.error("Erreur markAbsenceAsCaughtUp:", error);
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}
