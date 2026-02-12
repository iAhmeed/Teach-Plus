import { prisma } from "@/lib/prisma"

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}


export async function POST(req) {
    try {
        const { description, from, to, academicYear } = await req.json()
        if ([description, from, to, academicYear].some((data) => !data)) {
            return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
        }

        const holidays = await prisma.holiday.findMany({
            select: { from: true, to: true }
        });

        for (let holiday of holidays) {
            if (isSameDay(new Date(holiday.from), new Date(from)) && isSameDay(new Date(holiday.to), new Date(to))) {
                return Response.json({ status: "FAILED", message: "This holiday already exists !" }, { status: 409 })
            }
        }

        await prisma.holiday.create({
            data: {
                description: description,
                from: new Date(from),
                to: new Date(to),
                academic_year: academicYear
            }
        });

        return Response.json({ status: "SUCCESS", message: "Holiday added successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const holidays = await prisma.holiday.findMany();

        if (!holidays.length) {
            return Response.json({ status: "FAILED", message: "No holidays found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Holidays found successfully !", holidays: holidays }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}