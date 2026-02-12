import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 🔹 GET : Récupérer tous les enseignants
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminIdParam = searchParams.get("adminId");

    if (adminIdParam) {
      const authorizedAdminId = req.headers.get("x-admin-id")
      if (adminIdParam != authorizedAdminId) {
        return NextResponse.json({ status: "FAILED", message: "Unauthorized ! the requested admin is not the same as the logged in admin" }, { status: 401 })
      }

      const teachers = await prisma.teacher.findMany({
        where: {
          admin_id: Number(authorizedAdminId)
        }
      });

      if (!teachers) {
        return NextResponse.json({ status: "FAILED", message: "Teachers not found !" }, { status: 404 })
      }

      let teachersWithRanks = []
      for (const teacher of teachers) {
        // Find the current rank (latest starting_date)
        const rank = await prisma.ranksOfTeacher.findFirst({
          where: {
            teacher_id: teacher.teacher_id
          },
          orderBy: {
            starting_date: 'desc'
          },
          select: {
            rank: true
          }
        });

        if (rank) {
          teachersWithRanks.push(Object.assign({}, teacher, rank))
        }
        else {
          teachersWithRanks.push(Object.assign({}, teacher, { rank: null }))
        }
      }
      return NextResponse.json({ status: "SUCCESS", message: "Teachers found successfully !", teachers: teachersWithRanks }, { status: 200 })
    }
    else {
      const teachers = await prisma.teacher.findMany();
      return NextResponse.json(teachers, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching teachers:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({
      error: "Internal Server Error",
      message: errorMessage
    }, { status: 500 });
  }
}

// 🔹 POST : Ajouter un enseignant
export async function POST(req: Request) {
  try {
    const authorizedAdminId = req.headers.get("x-admin-id")
    const body = await req.json();
    let { firstName, familyName, email, picture, phoneNumber, dateOfBirth, hoursOutside, bio, type, accountNumber } = body;
    if (!firstName || !familyName || !email || !type) {
      return NextResponse.json({ status: "FAILED", message: "A required data filed is missing !" }, { status: 400 })
    }
    picture = picture || null
    phoneNumber = phoneNumber || null
    dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null; // Make truly optional
    hoursOutside = hoursOutside || 0
    bio = bio || null
    accountNumber = accountNumber || null

    // Check for duplicates
    const teacherWithSameEmail = await prisma.teacher.findUnique({ where: { email } });
    if (teacherWithSameEmail) {
      return NextResponse.json({ status: "FAILED", message: "Email must be unique !" }, { status: 400 })
    }

    if (phoneNumber) {
      const teacherWithSamePhoneNumber = await prisma.teacher.findUnique({ where: { phone_number: phoneNumber } });
      if (teacherWithSamePhoneNumber) {
        return NextResponse.json({ status: "FAILED", message: "Phone number must be unique !" }, { status: 400 })
      }
    }

    if (accountNumber) {
      const teacherWithSameAccountNumber = await prisma.teacher.findUnique({ where: { account_number: accountNumber } });
      if (teacherWithSameAccountNumber) {
        return NextResponse.json({ status: "FAILED", message: "Account number must be unique !" }, { status: 400 })
      }
    }

    const result = await prisma.teacher.create({
      data: {
        first_name: firstName,
        family_name: familyName,
        email: email,
        picture: picture,
        hours_outside: Number(hoursOutside),
        phone_number: phoneNumber,
        date_of_birth: new Date(dateOfBirth),
        admin_id: Number(authorizedAdminId),
        bio: bio,
        type: type,
        account_number: accountNumber
      }
    });

    return NextResponse.json({ message: "Teacher added", id: result.teacher_id }, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
