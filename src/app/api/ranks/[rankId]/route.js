import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { rankId } = await params

        const rank = await prisma.ranksOfTeacher.findUnique({
            where: { rank_id: Number(rankId) }
        });

        if (!rank) {
            return Response.json({ status: "FAILED", message: "Rank not found !" }, { status: 404 })
        }

        // Check ownership via teacher
        const teacherOfRank = await prisma.teacher.findUnique({
            where: { teacher_id: rank.teacher_id }
        });

        if (!teacherOfRank) {
            return Response.json({ status: "FAILED", message: "Rank's teacher not found !" }, { status: 404 })
        }

        if (teacherOfRank.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This rank doesn't belong to this admin" }, { status: 401 })
        }

        let { newTeacherId, newStartingDate, newRank } = await req.json()

        // If teacher ID is changing, verify new teacher
        if (newTeacherId && newTeacherId != rank.teacher_id) {
            const newTeacher = await prisma.teacher.findUnique({
                where: { teacher_id: Number(newTeacherId) }
            });

            if (!newTeacher) {
                return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown !" }, { status: 404 })
            }
            if (newTeacher.admin_id != Number(authorizedAdminId)) {
                return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin !" }, { status: 401 })
            }
        }

        await prisma.ranksOfTeacher.update({
            where: { rank_id: Number(rankId) },
            data: {
                teacher_id: newTeacherId ? Number(newTeacherId) : undefined,
                starting_date: newStartingDate ? new Date(newStartingDate) : undefined,
                rank: newRank || undefined
            }
        });

        return Response.json({ status: "SUCCESS", message: "Rank updated successfully !" }, { status: 200 })

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}


export async function DELETE(req, context) {
    try {
        const { rankId } = await context.params;

        if (!rankId) {
            return NextResponse.json({ message: "rankId est requis" }, { status: 400 });
        }
        const authorizedAdminId = req.headers.get("x-admin-id")

        const rank = await prisma.ranksOfTeacher.findUnique({
            where: { rank_id: Number(rankId) }
        });

        if (!rank) {
            return Response.json({ status: "FAILED", message: "Rank not found or its admin is unknown !" }, { status: 404 })
        }

        const teacherOfRank = await prisma.teacher.findUnique({
            where: { teacher_id: rank.teacher_id }
        });

        if (!teacherOfRank) {
            return Response.json({ status: "FAILED", message: "Rank's teacher not found !" }, { status: 404 })
        }

        if (teacherOfRank.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! This rank doesn't belong to this admin" }, { status: 401 })
        }

        // Supprimer le grade
        await prisma.ranksOfTeacher.delete({
            where: { rank_id: Number(rankId) }
        });

        return NextResponse.json({ message: "Grade supprimé avec succès" }, { status: 200 });

    } catch (error) {
        console.error("Erreur deleteRank:", error);
        return NextResponse.json({ message: "Erreur serveur", error: error.message }, { status: 500 });
    }
}
