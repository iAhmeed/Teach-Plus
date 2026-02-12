import { prisma } from "@/lib/prisma";

async function getTeacherPeriods(teacherId, academicYear) {
  const [startYear, endYear] = academicYear.split('/');
  if (!startYear || !endYear) throw new Error("Invalid Year Format");

  const academicYearStart = new Date(`${startYear}-08-31`);
  const academicYearEnd = new Date(`${endYear}-07-31`);
  const now = new Date();

  const periods = await prisma.period.findMany({
    where: {
      from: { gte: academicYearStart },
      to: { lte: academicYearEnd },
      NOT: { from: { gt: now } }
    }
  });

  const rankChanges = await prisma.ranksOfTeacher.findMany({
    where: {
      teacher_id: Number(teacherId),
      starting_date: {
        gte: academicYearStart,
        lte: academicYearEnd
      },
      NOT: { starting_date: { gt: now } }
    },
    orderBy: { starting_date: 'asc' },
    select: { starting_date: true }
  });

  if (rankChanges.length === 0) {
    const availablePeriods = periods.filter(p => {
      const periodStart = new Date(p.from);
      const periodEnd = new Date(p.to);
      return periodEnd.getTime() < now.getTime() && periodStart.getTime() < now.getTime();
    });

    let periodsWithRanks = [];
    for (const period of availablePeriods) {
      const rank = await prisma.ranksOfTeacher.findFirst({
        where: {
          teacher_id: Number(teacherId),
          starting_date: { lte: period.from }
        },
        orderBy: { starting_date: 'desc' },
        select: { rank: true }
      });

      periodsWithRanks.push({
        from: new Date(period.from).toISOString().split('T')[0],
        to: new Date(period.to).toISOString().split('T')[0],
        rank: rank ? rank.rank : null
      });
    }
    return periodsWithRanks
  }

  const result = [];

  for (const period of periods) {
    const periodStart = new Date(period.from);
    const periodEnd = new Date(period.to);

    // Skip future periods logic inside the loop if needed, though query handles some
    // The original logic filters changes within the period
    const changesInPeriod = rankChanges.filter(change => {
      const changeDate = new Date(change.starting_date);
      return changeDate.getTime() > periodStart.getTime() && changeDate.getTime() < periodEnd.getTime() && changeDate.getTime() < now.getTime();
    });

    if (changesInPeriod.length === 0) {
      if (periodEnd.getTime() < now.getTime()) {
        const rank = await prisma.ranksOfTeacher.findFirst({
          where: {
            teacher_id: Number(teacherId),
            starting_date: { lte: period.from }
          },
          orderBy: { starting_date: 'desc' },
          select: { rank: true }
        });

        result.push({
          from: new Date(period.from).toISOString().split('T')[0],
          to: new Date(period.to).toISOString().split('T')[0],
          rank: rank ? rank.rank : null
        });
      }
    } else {
      let currentStart = periodStart;
      const sortedChanges = changesInPeriod
        .map(c => new Date(c.starting_date))
        .sort((a, b) => a.getTime() - b.getTime());

      for (const changeDate of sortedChanges) {
        const rank = await prisma.ranksOfTeacher.findFirst({
          where: {
            teacher_id: Number(teacherId),
            starting_date: { lte: currentStart }
          },
          orderBy: { starting_date: 'desc' },
          select: { rank: true }
        });

        result.push({
          from: currentStart.toISOString().split('T')[0],
          // Original: changeDate - 1 day (86400000 ms)
          to: new Date(changeDate.getTime() - 86400000).toISOString().split('T')[0],
          rank: rank ? rank.rank : null
        });
        currentStart = changeDate;
      }

      if (periodEnd.getTime() < now.getTime()) {
        const rank = await prisma.ranksOfTeacher.findFirst({
          where: {
            teacher_id: Number(teacherId),
            starting_date: { lte: currentStart }
          },
          orderBy: { starting_date: 'desc' },
          select: { rank: true }
        });

        result.push({
          from: currentStart.toISOString().split('T')[0],
          to: periodEnd.toISOString().split('T')[0],
          rank: rank ? rank.rank : null
        });
      }
    }
  }

  return result;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const academicYear = searchParams.get('academicYear');

    if (!teacherId || !academicYear) {
      return Response.json({ status: "FAILED", message: "A required data field is missing !" }, { status: 400 })
    }

    const periods = await getTeacherPeriods(teacherId, academicYear);

    return Response.json({ status: "SUCCESS", message: "Sub-Periods found successfully !", data: periods }, { status: 200 })

  } catch (error) {
    return Response.json({ status: "FAILED", message: error.message }, { status: 500 })
  }
}
