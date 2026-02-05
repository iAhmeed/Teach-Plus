import { database } from "@/lib/mysql";

export async function POST(req) {
    try {
        const { rankName, rankPrice, fiscalYear } = await req.json();

        if (!rankName || !rankPrice) {
            return Response.json({ status: "FAILED", message: "A required data field is missing" }, { status: 400 })
        }
        const [existingRank] = await database.execute("SELECT * FROM Ranks")
        for (let rank of existingRank) {
            if (rank.rank_name == rankName && rank.fiscal_year == fiscalYear && rank.rank_price == rankPrice) {
                return Response.json({ status: "FAILED", message: "This rank already exists" }, { status: 409 })
            }
        }
        await database.execute("INSERT INTO Ranks (rank_name, rank_price, fiscal_year) VALUES (?, ?, ?)", [rankName, rankPrice, fiscalYear])
        return Response.json({ status: "SUCCESS", message: "Rank added successfully !" }, { status: 200 })

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const [ranks] = await database.execute("SELECT * FROM Ranks")
        if (!ranks.length) {
            return Response.json({ status: "FAILED", message: "No ranks found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Ranks found successfully !", ranks: ranks }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}