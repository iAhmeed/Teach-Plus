import { database } from "@/lib/mysql";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let from = searchParams.get("from");
        let to = searchParams.get("to");
        from = new Date(from);
        to = new Date(to);
        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() + 1);
        const authorizedAdminId = req.headers.get("x-admin-id")
        if (!authorizedAdminId) {
            return Response.json({ status: "FAILED", message: "Unauthorized access" }, { status: 401 });
        }
        const [totalTeachersCount] = await database.execute("SELECT COUNT(*) as count FROM Teachers WHERE admin_id = ?", [authorizedAdminId])
        const [activeTeachersCount] = await database.execute("SELECT COUNT(*) as count FROM Teachers WHERE admin_id = ? AND is_active = true", [authorizedAdminId])
        const [inactiveTeachersCount] = await database.execute("SELECT COUNT(*) as count FROM Teachers WHERE admin_id = ? AND is_active = false", [authorizedAdminId])
        const [totalAmount] = await database.execute("SELECT SUM(amount_of_money) as total FROM Extra_hours_sheet WHERE `from` >= ? AND `to` <= ?", [from, to])
        const teachersCountDistributionByRankQuery = `
        SELECT 
            latest_ranks.rank AS rank,
            COUNT(*) AS teachers_count
        FROM (
            SELECT 
                r1.teacher_id,
                r1.rank
            FROM 
                Ranks_of_teachers r1
            JOIN (
                SELECT 
                    teacher_id,
                    MAX(starting_date) AS latest_starting_date
                FROM 
                    Ranks_of_teachers
                GROUP BY 
                    teacher_id
            ) r2 ON r1.teacher_id = r2.teacher_id AND r1.starting_date = r2.latest_starting_date
        ) AS latest_ranks
        GROUP BY 
            latest_ranks.rank
        ORDER BY 
            teachers_count DESC;
        `
        const [teachersCountDistributionByRank] = await database.execute(teachersCountDistributionByRankQuery)
    
        const absencesCountDistributionByMonthQuery = `
        SELECT 
            MONTH(date) AS month,
            COUNT(*) AS absences_count
        FROM 
            Absences
        WHERE 
            date BETWEEN ? AND ?
        GROUP BY 
            MONTH(date)
        ORDER BY 
            month;
        `
        const [absencesCountDistributionByMonth] = await database.execute(absencesCountDistributionByMonthQuery, [from, to])
        const [nextHoliday] = await database.execute("SELECT * FROM Holidays WHERE `from` > CURDATE() ORDER BY `from` ASC LIMIT 1")
        return Response.json({
            status: "SUCCESS",
            message: "Statistics fetched successfully !",
            data: {
                totalTeachersCount: totalTeachersCount[0].count,
                activeTeachersCount: activeTeachersCount[0].count,
                inactiveTeachersCount: inactiveTeachersCount[0].count,
                totalAmount: totalAmount[0].total || 0,
                teachersCountDistributionByRank,
                absencesCountDistributionByMonth,
                nextHoliday: nextHoliday.length ? nextHoliday[0] : null
            }
        }, { status: 200 });

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 });
    }
} 