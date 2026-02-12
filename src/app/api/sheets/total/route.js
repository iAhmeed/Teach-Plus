import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const category = searchParams.get("category");
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        // Validate required parameters
        if (!type || !category) {
            return Response.json(
                { status: "FAILED", message: "Type and category are required" },
                { status: 400 }
            );
        }

        const authorizedAdminId = req.headers.get("x-admin-id");
        if (!authorizedAdminId) {
            return Response.json(
                { status: "FAILED", message: "Unauthorized access" },
                { status: 401 }
            );
        }

        // Build query dynamically based on provided parameters
        // Using Prisma $queryRawUnsafe for dynamic query construction with parameters

        let query = `
            SELECT 
                CONCAT(first_name, " ", family_name) as full_name, 
                account_number, 
                rank, 
                rank_price, 
                extra_hours_number, 
                amount_of_money, 
                \`from\`, 
                \`to\`, 
                amount_of_money * 9/100 AS social_security, 
                (amount_of_money - amount_of_money * 9/100) * 10/100 AS irg, 
                amount_of_money * 9/100 + (amount_of_money - amount_of_money * 9/100) * 10/100 AS debited_amount, 
                amount_of_money - (amount_of_money * 9/100 + (amount_of_money - amount_of_money * 9/100) * 10/100) AS net_amount
            FROM Teachers T 
            JOIN Extra_hours_sheet E ON T.teacher_id = E.teacher_id 
            WHERE T.admin_id = ? 
            AND T.type = ? 
            AND account_number ${category !== "CCP" ? "NOT" : ""} REGEXP '^[0-9]{10} [0-9]{2}$'
        `;

        const params = [authorizedAdminId, type];

        // Add date filters if provided
        if (from) {
            query += " AND E.from >= ?";
            params.push(from);
        }
        if (to) {
            query += " AND E.to <= ?";
            params.push(to);
        }

        const data = await prisma.$queryRawUnsafe(query, ...params);

        // Serialize BigInt if necessary
        const serializeBigInt = (obj) => {
            return JSON.parse(JSON.stringify(obj, (key, value) =>
                typeof value === 'bigint'
                    ? value.toString()
                    : value
            ));
        }

        return Response.json(
            { status: "SUCCESS", data: serializeBigInt(data) },
            { status: 200 }
        );

    } catch (err) {
        console.error("Database error:", err);
        return Response.json(
            {
                status: "FAILED",
                message: "Database operation failed",
                error: process.env.NODE_ENV === "development" ? err.message : null
            },
            { status: 500 }
        );
    }
}
