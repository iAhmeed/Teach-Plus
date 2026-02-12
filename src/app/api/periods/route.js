import { prisma } from "@/lib/prisma"

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export async function POST(req) {
    try {
        const { from, to, name } = await req.json()
        if ([from, to].some((data) => !data)) {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }

        const periods = await prisma.period.findMany({
            select: { from: true, to: true }
        });

        for (let period of periods) {
            if (isSameDay(new Date(period.from), new Date(from)) && isSameDay(new Date(period.to), new Date(to))) {
                return Response.json({ status: "FAILED", message: "This period already exists !" }, { status: 409 })
            }
        }

        await prisma.period.create({
            data: {
                from: new Date(from),
                to: new Date(to),
                name: name || null
            }
        });

        return Response.json({ status: "SUCCESS", message: "Period added successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const periods = await prisma.period.findMany();

        if (!periods.length) {
            return Response.json({ status: "FAILED", message: "No periods found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Periods found successfully !", periods: periods }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}