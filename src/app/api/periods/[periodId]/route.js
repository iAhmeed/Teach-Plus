import { prisma } from "@/lib/prisma"

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export async function PUT(req, { params }) {
    try {
        const { periodId } = await params

        const period = await prisma.period.findUnique({
            where: { period_id: Number(periodId) }
        });

        if (!period) {
            return Response.json({ status: "FAILED", message: "Period not found" }, { status: 404 })
        }

        const { newName, newFrom, newTo } = await req.json()

        const periods = await prisma.period.findMany({
            where: { NOT: { period_id: Number(periodId) } },
            select: { from: true, to: true }
        });

        for (let p of periods) {
            if (isSameDay(new Date(p.from), new Date(newFrom)) && isSameDay(new Date(p.to), new Date(newTo))) {
                return Response.json({ status: "FAILED", message: "This holiday already exists !" }, { status: 409 })
            }
        }

        await prisma.period.update({
            where: { period_id: Number(periodId) },
            data: {
                name: newName || undefined,
                from: newFrom ? new Date(newFrom) : undefined,
                to: newTo ? new Date(newTo) : undefined
            }
        });

        return Response.json({ status: "SUCCESS", message: "Period updated successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const { periodId } = await params

        const period = await prisma.period.findUnique({
            where: { period_id: Number(periodId) }
        });

        if (!period) {
            return Response.json({ status: "FAILED", message: "Period not found" }, { status: 404 })
        }

        await prisma.period.delete({
            where: { period_id: Number(periodId) }
        });

        return Response.json({ status: "SUCCESS", message: "Period deleted successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}
