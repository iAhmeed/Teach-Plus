import { database } from "@/lib/mysql";

export async function POST(req) {
    try {
        // Get the admin ID from headers
        const authorizedAdminId = req.headers.get("x-admin-id");

        // Check if the admin exists
        const [adminRows] = await database.execute("SELECT * FROM Admins WHERE admin_id = ?", [authorizedAdminId]);
        if (adminRows.length === 0) {
            return Response.json({ status: "FAILED", message: "Admin not found!" }, { status: 404 });
        }
        const authorizedAdmin = adminRows[0]; // Get the first matching admin

        // Extract request body
        let { teacherId, dayOfWeek, startTime, endTime, type, classroom, module, groupNumber, academicYear, academicLevel, semester } = await req.json();

        // Validate required fields
        if ([teacherId, dayOfWeek, startTime, endTime, type, classroom, groupNumber, academicLevel, academicYear, semester].some((data) => data === undefined || data === "")) {
            return Response.json({ status: "FAILED", message: "A required data field is missing!" }, { status: 400 });
        }
        module = module || null; // Ensure module is null if not provided

        // Check if teacher exists and get their associated admin
        const [teacherRows] = await database.execute("SELECT admin_id FROM Teachers WHERE teacher_id = ?", [teacherId]);
        if (teacherRows.length === 0) {
            return Response.json({ status: "FAILED", message: "Teacher doesn't exist or his admin is unknown!" }, { status: 404 });
        }
        const teacherAdminId = teacherRows[0].admin_id; // Get the teacher's admin ID

        // Authorization check
        if (teacherAdminId !== authorizedAdmin.admin_id) {
            console.log("Teacher's admin:", teacherAdminId, " | Requesting admin:", authorizedAdmin.admin_id);
            return Response.json({ status: "FAILED", message: "Unauthorized! This teacher doesn't belong to this admin." }, { status: 401 });
        }

        // Insert session
        const insertionQuery = `
            INSERT INTO Sessions(admin_id, teacher_id, day_of_week, start_time, end_time, type, module, classroom, group_number, academic_year, academic_level, semester, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        await database.execute(insertionQuery, [
            authorizedAdminId, teacherId, dayOfWeek, startTime, endTime, type, module, classroom, groupNumber, academicYear, academicLevel, semester
        ]);

        return Response.json({ status: "SUCCESS", message: "Session added successfully!" }, { status: 200 });

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
}
