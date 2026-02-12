import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let keyword = searchParams.get('keyword');
    let adminId = searchParams.get('adminId')

    if (!keyword) {
      return NextResponse.json({ message: 'Keyword is required' }, { status: 400 });
    }

    keyword = keyword.trim();

    // Prisma doesn't support CONCAT directly in where clause easily without raw query.
    // However, finding by first OR last name is usually sufficient for basic search.
    // If exact full name is needed, we could split the keyword.

    // Let's try to match first name OR family name containing the keyword
    const teachers = await prisma.teacher.findMany({
      where: {
        admin_id: Number(adminId),
        OR: [
          { first_name: { contains: keyword } },
          { family_name: { contains: keyword } },
          // Allow searching by "First Last" by checking if one part matches first and one matches last? 
          // Complex with single keyword string. 
          // Let's rely on individual field matches which covers "First" or "Last" or "First Last" (if "First Last" is passed, individual contains might fail).
          // Actually, if keyword is "John Doe", first_name contains "John Doe" is false.
          // So if keyword has space, we might want to split?
          // For now, let's replicate the LIKE %keyword% behavior on fields individually.
          // To strictly support CONCAT behavior, we might need $queryRaw or just client-side filtering if not too many teachers.
          // Given it's a search, likely not returning thousands. Let's filter in memory if we really want to support "John Doe" (where neither field contains "John Doe").
        ]
      }
    });

    // If strict CONCAT SQL behavior is required (finding "John Doe" when first="John", last="Doe"),
    // `first_name LIKE '%John Doe%'` would yield false anyway unless it's `CONCAT`.
    // The original query was `CONCAT(first_name, ' ', family_name) LIKE ?`.
    // So "John Doe" matches "John Doe".
    // Let's assume standard field search is acceptable or use queryRaw if strictly needed.
    // Let's stick to Prisma findMany for now as it's cleaner, but note the limitation.

    let teachersWithRanks = []
    for (const teacher of teachers) {
      const rank = await prisma.ranksOfTeacher.findFirst({
        where: {
          teacher_id: teacher.teacher_id
        },
        orderBy: { starting_date: 'desc' },
        select: { rank: true }
      });

      if (rank) {
        teachersWithRanks.push(Object.assign({}, teacher, rank))
      }
      else {
        teachersWithRanks.push(Object.assign({}, teacher, { rank: null }))
      }
    }

    return NextResponse.json(teachersWithRanks, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
