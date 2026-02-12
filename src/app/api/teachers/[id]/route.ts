import { prisma } from "@/lib/prisma"

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params
    const authorizedAdminId = req.headers.get("x-admin-id")

    const teacher = await prisma.teacher.findFirst({
      where: {
        teacher_id: Number(id),
        admin_id: Number(authorizedAdminId)
      }
    });

    if (!teacher) {
      return Response.json({ status: "FAILED", message: "Teacher not found or doesn't belong to this admin !" }, { status: 400 })
    }

    return Response.json({ status: "SUCCESS", message: "Teacher found successfully !", teacher: teacher }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Database query failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const authorizedAdminId = req.headers.get("x-admin-id")
    const { id } = await context.params;

    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: Number(id) },
      select: { admin_id: true }
    });

    if (!teacher) {
      return Response.json({ status: "FAILED", message: "Teacher not found or his admin is unkown !" }, { status: 404 })
    }
    if (teacher.admin_id != Number(authorizedAdminId)) {
      return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin" }, { status: 401 })
    }

    const body = await req.json();
    const { firstName, familyName, email, picture, phoneNumber, dateOfBirth, hoursOutside, bio, isActive, type, accountNumber } = body;

    // Check duplicates
    const duplicatedEmail = await prisma.teacher.findFirst({
      where: {
        email: email,
        NOT: { teacher_id: Number(id) }
      }
    });

    const duplicatedPhone = await prisma.teacher.findFirst({
      where: {
        phone_number: phoneNumber,
        NOT: { teacher_id: Number(id) }
      }
    });

    const duplicatedAccount = await prisma.teacher.findFirst({
      where: {
        account_number: accountNumber,
        NOT: { teacher_id: Number(id) }
      }
    });

    if (duplicatedAccount) {
      return Response.json({ status: "FAILED", message: "Account number must be unique !" }, { status: 400 })
    }
    if (duplicatedEmail) {
      return Response.json({ status: "FAILED", message: "Email must be unique !" }, { status: 400 })
    }
    if (duplicatedPhone) {
      return Response.json({ status: "FAILED", message: "Phone number must be unique !" }, { status: 400 })
    }

    await prisma.teacher.update({
      where: { teacher_id: Number(id) },
      data: {
        first_name: firstName,
        family_name: familyName,
        email: email,
        picture: picture,
        hours_outside: Number(hoursOutside),
        phone_number: phoneNumber,
        date_of_birth: new Date(dateOfBirth),
        bio: bio,
        is_active: isActive ? 1 : 0, // Convert boolean to Int
        type: type,
        account_number: accountNumber
      }
    });

    return Response.json({ message: "Teacher updated successfully" }, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: "Database update failed", message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const authorizedAdminId = req.headers.get("x-admin-id")
    const { id } = await context.params
    const teacherId = Number(id);

    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
      select: { admin_id: true }
    });

    if (!teacher) {
      return Response.json({ status: "FAILED", message: "Teacher not found or his admin is unknown !" }, { status: 404 })
    }
    if (teacher.admin_id != Number(authorizedAdminId)) {
      return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin" })
    }

    // Manual cascade delete transaction
    await prisma.$transaction(async (tx) => {
      await tx.ranksOfTeacher.deleteMany({ where: { teacher_id: teacherId } });
      await tx.absence.deleteMany({ where: { teacher_id: teacherId } });

      const sessions = await tx.session.findMany({ where: { teacher_id: teacherId }, select: { session_id: true } });
      for (const session of sessions) {
        await tx.absence.deleteMany({ where: { session_id: session.session_id } });
      }

      await tx.session.deleteMany({ where: { teacher_id: teacherId } });

      // Delete Extra Days related to sheets of this teacher
      // Find sheets first
      const sheets = await tx.extraHoursSheet.findMany({ where: { teacher_id: teacherId }, select: { sheet_id: true } });
      const sheetIds = sheets.map(s => s.sheet_id);
      if (sheetIds.length > 0) {
        await tx.extraDay.deleteMany({ where: { sheet_id: { in: sheetIds } } });
      }

      await tx.extraHoursSheet.deleteMany({ where: { teacher_id: teacherId } });
      await tx.teacher.delete({ where: { teacher_id: teacherId } });
    });

    return Response.json({ status: "SUCCESS", message: "Teacher deleted successfully" })
  } catch (err: any) {
    return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const authorizedAdminId = req.headers.get("x-admin-id")
    const { id } = await context.params
    const teacherId = Number(id);

    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
      select: { admin_id: true }
    });

    if (!teacher) {
      return Response.json({ status: "FAILED", message: "Teacher not found or his admin is unknown !" }, { status: 404 })
    }
    if (teacher.admin_id != Number(authorizedAdminId)) {
      return Response.json({ status: "FAILED", message: "Unauthorized ! this teacher doesn't belong to this admin" })
    }

    await prisma.teacher.update({
      where: { teacher_id: teacherId },
      data: { is_active: 0 }
    });

    return Response.json({ status: "SUCCESS", message: "Teacher deleted logically !" }, { status: 200 })
  } catch (err: any) {
    return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
  }
}
