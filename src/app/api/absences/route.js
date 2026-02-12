import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { searchParams } = new URL(req.url)

        if (!searchParams.get("teacherId")) {
            // Get all absences for this admin
            // Join Absences -> Teachers -> Admins
            const absences = await prisma.absence.findMany({
                where: {
                    teacher: {
                        admin_id: Number(authorizedAdminId)
                    }
                },
                // match select fields from original query implies all or specific?
                // Original: SELECT A.absence_id, A.teacher_id, A.session_id, A.date, A.caught_up, A.reason, A.notes, A.created_at, A.updated_at
                select: {
                    absence_id: true,
                    teacher_id: true,
                    session_id: true,
                    date: true,
                    caught_up: true,
                    reason: true,
                    notes: true,
                    created_at: true,
                    updated_at: true
                }
            });

            if (!absences.length) {
                return Response.json({ status: "FAILED", message: "No absences found !" }, { status: 404 })
            }
            return Response.json({ status: "SUCCESS", message: "Absences found successfully !", absences: absences }, { status: 200 })
        } else {
            const teacherId = searchParams.get("teacherId")

            const teacher = await prisma.teacher.findUnique({
                where: { teacher_id: Number(teacherId) }
            });

            if (!teacher) {
                return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
            }
            if (teacher.admin_id != Number(authorizedAdminId)) {
                return Response.json({ status: "FAILED", message: "Unauthorized ! This teacher doesn't belong to this admin" }, { status: 401 })
            }

            const absences = await prisma.absence.findMany({
                where: { teacher_id: Number(teacherId) }
            });

            return Response.json({ status: "SUCCESS", message: "Absences found successfully !", absences: absences }, { status: 200 })
        }
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
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
        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: Number(teacherId) }
        });

        if (!teacher) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
        }
        if (teacher.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin !" }, { status: 401 })
        }

        //special case 2 : if the entered session doesn't belong to this admin : 
        const session = await prisma.session.findUnique({
            where: { session_id: Number(sessionId) }
        });

        if (!session) {
            return Response.json({ status: "FAILED", message: "Session doesn't exist or its admin is unknown !" }, { status: 404 })
        }
        if (session.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! this session doesn't belong to this admin" }, { status: 401 })
        }

        //special case 3 : if the entered session belongs to another teacher rather than the entered teacher
        if (session.teacher_id != Number(teacherId)) {
            return Response.json({ status: "FAILED", message: "This session dosn't belong to this teacher !" }, { status: 400 })
        }

        const newAbsence = await prisma.absence.create({
            data: {
                teacher_id: Number(teacherId),
                session_id: Number(sessionId),
                date: new Date(date),
                notes: notes || "",
                reason: reason || ""
            }
        });

        return NextResponse.json({ message: "Absence enregistrée avec succès", absenceId: newAbsence.absence_id }, { status: 201 });

    } catch (error) {
        console.error("Erreur markAbsence:", error);
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}
