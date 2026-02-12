import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        // Get the admin ID from headers
        const authorizedAdminId = req.headers.get("x-admin-id");

        // Check if the admin exists
        const authorizedAdmin = await prisma.admin.findUnique({
            where: { admin_id: Number(authorizedAdminId) }
        });

        if (!authorizedAdmin) {
            return Response.json({ status: "FAILED", message: "Admin not found!" }, { status: 404 });
        }

        // Extract request body
        let { teacherId, dayOfWeek, startTime, endTime, type, classroom, module, groupNumber, academicYear, academicLevel, semester } = await req.json();

        // Validate required fields
        if ([teacherId, dayOfWeek, startTime, endTime, type, classroom, groupNumber, academicLevel, academicYear, semester].some((data) => data === undefined || data === "")) {
            return Response.json({ status: "FAILED", message: "A required data field is missing!" }, { status: 400 });
        }
        module = module || ""; // Ensure string if not strict null

        // Check if teacher exists and get their associated admin
        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: Number(teacherId) },
            select: { admin_id: true }
        });

        if (!teacher) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown!" }, { status: 404 });
        }
        const teacherAdminId = teacher.admin_id; // Get the teacher's admin ID

        // Authorization check
        if (teacherAdminId !== authorizedAdmin.admin_id) {
            return Response.json({ status: "FAILED", message: "Unauthorized! This teacher doesn't belong to this admin." }, { status: 401 });
        }

        // Insert session
        await prisma.session.create({
            data: {
                admin_id: Number(authorizedAdminId),
                teacher_id: Number(teacherId),
                day_of_week: dayOfWeek,
                start_time: new Date(`1970-01-01T${startTime}Z`), // Ensure valid Date object for Time type if prisma expects it, or pass string if configured. 
                // Schema says DateTime @db.Time, so best to pass Date object.
                // However, usually we pass a full ISO date. Since it's just Time, Prisma might handle ISO string if it contains date component.
                // Wait, db.Time only stores time. If we pass a full Date, it extracts the time.
                // Or if we pass "HH:mm:ss" string, it might work depending on driver. 
                // Prisma client expects Date object for DateTime fields.
                // Let's assume input startTime is "HH:mm:ss" or similar.
                end_time: new Date(`1970-01-01T${endTime}Z`),
                type: type,
                module: module,
                classroom: classroom,
                group_number: groupNumber,
                academic_year: academicYear,
                academic_level: Number(academicLevel),
                semester: semester
            }
        });

        return Response.json({ status: "SUCCESS", message: "Session added successfully!" }, { status: 200 });

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}
