import { prisma } from "@/lib/prisma";

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export async function PUT(req, { params }) {
    try {
        const { holidayId } = await params;

        const holiday = await prisma.holiday.findUnique({
            where: { holiday_id: Number(holidayId) }
        });

        if (!holiday) {
            return Response.json({ status: "FAILED", message: "Holiday not found" }, { status: 404 });
        }

        const { newDescription, newFrom, newTo, newAcademicYear } = await req.json();

        const holidays = await prisma.holiday.findMany({
            where: { NOT: { holiday_id: Number(holidayId) } },
            select: { from: true, to: true }
        });

        for (let h of holidays) {
            if (isSameDay(new Date(h.from), new Date(newFrom)) && isSameDay(new Date(h.to), new Date(newTo))) {
                return Response.json({ status: "FAILED", message: "This holiday already exists !" }, { status: 409 })
            }
        }

        await prisma.holiday.update({
            where: { holiday_id: Number(holidayId) },
            data: {
                description: newDescription || undefined,
                from: newFrom ? new Date(newFrom) : undefined,
                to: newTo ? new Date(newTo) : undefined,
                academic_year: newAcademicYear || undefined
            }
        });

        return Response.json({ status: "SUCCESS", message: "Holiday updated successfully !" }, { status: 200 });
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { holidayId } = await params;

        const holiday = await prisma.holiday.findUnique({
            where: { holiday_id: Number(holidayId) }
        });

        if (!holiday) {
            return Response.json({ status: "FAILED", message: "Holiday not found" }, { status: 404 });
        }

        await prisma.holiday.delete({
            where: { holiday_id: Number(holidayId) }
        });

        return Response.json({ status: "SUCCESS", message: "Holiday deleted successfully !" }, { status: 200 });
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}
