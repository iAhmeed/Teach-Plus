import { prisma } from "@/lib/prisma"

export async function DELETE(req, { params }) {
    try {
        const { sessionId } = await params
        const authorizedAdminId = req.headers.get("x-admin-id")

        const session = await prisma.session.findUnique({
            where: { session_id: Number(sessionId) }
        });

        if (!session) {
            return Response.json({ status: "FAILED", message: "Session doesn't exist or its admin is unknown !" }, { status: 404 })
        }
        if (session.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! can't delete a session that doesn't belong to you" }, { status: 401 })
        }
        if (!sessionId) {
            return Response.json({ status: "FAILED", message: "Session ID is required!" }, { status: 400 });
        }

        await prisma.$transaction([
            prisma.absence.deleteMany({
                where: { session_id: Number(sessionId) }
            }),
            prisma.session.delete({
                where: { session_id: Number(sessionId) }
            })
        ]);

        return Response.json({ status: "SUCESS", message: "Session deleted successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function PUT(req, { params }) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const { sessionId } = await params


        const session = await prisma.session.findUnique({
            where: { session_id: Number(sessionId) }
        });

        if (!session) {
            return Response.json({ status: "FAILED", message: "Session not found !" }, { status: 404 })
        }
        if (session.admin_id != Number(authorizedAdminId)) {
            return Response.json({ status: "FAILED", message: "Unauthorized ! can't update a session that doesn't belong to you !" }, { status: 401 })
        }

        const { teacherId, dayOfWeek, startTime, endTime, type, classroom, module, groupNumber, academicYear, academicLevel, semester, action } = await req.json()

        // If teacher is changing, verify new teacher
        if (teacherId && teacherId != session.teacher_id) {
            const teacher = await prisma.teacher.findUnique({
                where: { teacher_id: Number(teacherId) }
            });
            if (!teacher) {
                return Response.json({ status: "FAILED", message: "There is no teacher with this id !" }, { status: 400 })
            }
            if (teacher.admin_id != Number(authorizedAdminId)) {
                return Response.json({ status: "FAILED", message: "Unauthorized ! This teacher doesn't belong to this admin" }, { status: 401 })
            }
        }

        await prisma.$transaction(async (tx) => {
            if (action == "1") {
                await tx.absence.deleteMany({ where: { session_id: Number(sessionId) } })
            } else if (action == "2") {
                if (teacherId) {
                    await tx.absence.updateMany({
                        where: { session_id: Number(sessionId) },
                        data: { teacher_id: Number(teacherId) }
                    })
                }
            }

            await tx.session.update({
                where: { session_id: Number(sessionId) },
                data: {
                    teacher_id: teacherId ? Number(teacherId) : undefined,
                    day_of_week: dayOfWeek,
                    start_time: startTime ? new Date(`1970-01-01T${startTime}Z`) : undefined, // Convert only if provided.
                    // Wait, existing code uses raw strings if not provided?
                    // `startTime || session[0].start_time`. 
                    // If not provided, Prisma `update` ignores unused keys if we use `undefined`.
                    // But if key is present as undefined, it ignores it.
                    // However, we need to convert format if provided.
                    end_time: endTime ? new Date(`1970-01-01T${endTime}Z`) : undefined,
                    type: type,
                    module: module,
                    classroom: classroom,
                    group_number: groupNumber,
                    academic_year: academicYear,
                    academic_level: academicLevel ? Number(academicLevel) : undefined,
                    semester: semester
                }
            });
        });

        return Response.json({ status: "SUCCESS", message: "Session updated successfully !" }, { status: 200 })

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}
