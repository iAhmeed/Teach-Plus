import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 📌 Marquer une absence comme rattrapée
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const authorizedAdminId = req.headers.get("x-admin-id")

        if (!id) {
            return NextResponse.json({ message: "ID de l'absence requis" }, { status: 400 });
        }

        // Fetch absence with teacher relation to check admin
        const absence = await prisma.absence.findUnique({
            where: { absence_id: Number(id) },
            include: { teacher: true }
        });

        if (!absence || !absence.teacher) {
            return Response.json({ status: "FAILED", message: "Absence not found or its admin is unknown !" }, { status: 404 })
        }

        if (absence.teacher.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This absence doesn't belong to this admin" }, { status: 401 })
        }

        // Toggle caught_up status
        await prisma.absence.update({
            where: { absence_id: Number(id) },
            data: {
                caught_up: !absence.caught_up
            }
        });

        return NextResponse.json({ message: "Absence marquée comme rattrapée" }, { status: 200 });

    } catch (error) {
        console.error("Erreur markAbsenceAsCaughtUp:", error);
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}
