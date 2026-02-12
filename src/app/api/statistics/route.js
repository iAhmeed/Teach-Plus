import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let from = searchParams.get("from");
        let to = searchParams.get("to");

        // Ensure dates are valid
        if (!from || !to) {
            return Response.json({ status: "FAILED", message: "Date range required" }, { status: 400 });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        // Adjust dates as in original code
        fromDate.setDate(fromDate.getDate() - 1);
        toDate.setDate(toDate.getDate() + 1);

        const authorizedAdminId = req.headers.get("x-admin-id")
        if (!authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized access" }, { status: 401 });
        }

        const totalTeachersCount = await prisma.teacher.count({
            where: { admin_id: Number(authorizedAdminId) }
        });

        const activeTeachersCount = await prisma.teacher.count({
            where: {
                admin_id: Number(authorizedAdminId),
                is_active: 1
            }
        });

        const inactiveTeachersCount = await prisma.teacher.count({
            where: {
                admin_id: Number(authorizedAdminId),
                is_active: 0
            }
        });

        const totalAmountAgg = await prisma.extraHoursSheet.aggregate({
            _sum: {
                amount_of_money: true
            },
            where: {
                from: { gte: fromDate },
                to: { lte: toDate }
            }
        });
        const totalAmount = totalAmountAgg._sum.amount_of_money || 0;

        // Complex queries using $queryRaw for efficiency and SQL compatibility
        const teachersCountDistributionByRank = await prisma.$queryRaw`
            SELECT 
                r2.rank AS rank_name,
                COUNT(*) AS teachers_count
            FROM Teachers t
            JOIN Ranks_of_teachers r2 ON t.teacher_id = r2.teacher_id
            WHERE r2.starting_date = (
                SELECT MAX(starting_date)
                FROM Ranks_of_teachers r3
                WHERE r3.teacher_id = t.teacher_id
            )
            GROUP BY r2.rank
            ORDER BY teachers_count DESC;
        `;
        // Note: Renamed 'rank' to 'rank_name' to avoid reserved keyword potential issues, 
        // effectively matching correct column selection. 
        // Original query used 'rank', which is fine in MySQL but 'rank' property might be confusing.
        // Let's stick closer to original query logic but safe.
        // Actually, the original query had a subquery join structure which is effectively what I wrote above but simplified.

        const absencesCountDistributionByMonth = await prisma.$queryRaw`
            SELECT 
                MONTH(date) AS month,
                COUNT(*) AS absences_count,
                CAST(COUNT(*) AS DECIMAL) as absences_count -- Ensure number type if needed
            FROM 
                Absences
            WHERE 
                date BETWEEN ${fromDate} AND ${toDate}
            GROUP BY 
                MONTH(date)
            ORDER BY 
                month;
        `;


        const nextHoliday = await prisma.holiday.findFirst({
            where: {
                from: { gt: new Date() }
            },
            orderBy: {
                from: 'asc'
            }
        });

        // Serialization for BigInt handling if return from count(*) is BigInt in some Prisma versions/DBs
        // Usually fine with JSON.stringify but safer to map if needed. 
        // Here we just return directly.

        // Fix BigInt serialization issue if it arises:
        const serializeBigInt = (obj) => {
            return JSON.parse(JSON.stringify(obj, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value
            ));
        }

        return Response.json({
            status: "SUCCESS",
            message: "Statistics fetched successfully !",
            data: {
                totalTeachersCount,
                activeTeachersCount,
                inactiveTeachersCount,
                totalAmount,
                teachersCountDistributionByRank: serializeBigInt(teachersCountDistributionByRank),
                absencesCountDistributionByMonth: serializeBigInt(absencesCountDistributionByMonth),
                nextHoliday
            }
        }, { status: 200 });

    } catch (err) {
        console.error(err);
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
} 
