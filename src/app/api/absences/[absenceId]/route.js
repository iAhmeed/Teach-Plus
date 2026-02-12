import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(req, { params }) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { absenceId } = await params

        const absence = await prisma.absence.findUnique({
            where: { absence_id: Number(absenceId) },
            include: { teacher: true }
        });

        if (!absence || !absence.teacher) {
            return Response.json({ status: "FAILED", message: "Absence doesn't exist or its admin is unknown !" }, { status: 400 })
        }
        if (absence.teacher.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! this absence doesn't belong to this admin" }, { status: 401 })
        }

        await prisma.absence.delete({
            where: { absence_id: Number(absenceId) }
        });

        return Response.json({ status: "SUCCESS", message: "Absence deleted successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

// 📌 Mettre à jour une absence (PATCH)
export async function PATCH(req, { params }) {
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
        const { absenceId } = await params

        const absence = await prisma.absence.findUnique({
            where: { absence_id: Number(absenceId) },
            include: { teacher: true }
        });

        if (!absenceId) {
            return NextResponse.json({ message: "ID de l'absence requis" }, { status: 400 });
        }
        if (!absence) {
            return NextResponse.json({ status: "FAILED", message: "Absence not found !" }, { status: 404 })
        }

        teacherId = teacherId || absence.teacher_id

        if (!sessionId || !date) {
            return NextResponse.json({ message: "teacherId et sessionId et date sont requis" }, { status: 400 });
        }

        //special case 1 : if this absence doesn't belong to this admin : 
        if (!absence.teacher || absence.teacher.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This absence doesn't belong to this admin" }, { status: 401 })
        }

        //special case 2 : if the entered teacher doesn't belong to this admin : 
        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: Number(teacherId) }
        });

        if (!teacher) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
        }
        if (teacher.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin !" }, { status: 401 })
        }

        //special case 3 : if the entered session doesn't belong to this admin : 
        const session = await prisma.session.findUnique({
            where: { session_id: Number(sessionId) }
        });

        if (!session) {
            return Response.json({ status: "FAILED", message: "Session doesn't exist or its admin is unknown !" }, { status: 404 })
        }
        if (session.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! this session doesn't belong to this admin" }, { status: 401 })
        }

        //special case 4 : if the entered session belongs to another teacher rather than the entered teacher
        // Note: session teacher verification. Original code checked session's teacher_id.
        if (session.teacher_id != Number(teacherId)) {
            return Response.json({ status: "FAILED", message: "This session dosn't belong to this teacher !" }, { status: 400 })
        }

        const updatedAbsence = await prisma.absence.update({
            where: { absence_id: Number(absenceId) },
            data: {
                teacher_id: Number(teacherId),
                session_id: Number(sessionId),
                date: new Date(date),
                notes: notes || "",
                reason: reason || "",
                updated_at: new Date()
            }
        });

        return NextResponse.json({ message: "Absence mise à jour avec succès" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}

