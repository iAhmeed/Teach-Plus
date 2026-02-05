import { database } from "@/lib/mysql"

export async function PUT(req, { params }) {
    try {
        const { rankId } = await params
        const [rank] = await database.execute("SELECT * FROM Ranks WHERE rank_id = ?", [rankId])
        if (rank.length === 0) {
            return Response.json({ status: "FAILED", message: "Rank not found !" }, { status: 404 })
        }
        const { newRankName, newRankPrice, newFiscalYear } = await req.json()
        const [ranks] = await database.execute("SELECT * FROM Ranks WHERE rank_id != ?", [rankId])
        for (let rank of ranks) {
            if (rank.rank_name == newRankName && rank.rank_price == newRankPrice && rank.fiscal_year == newFiscalYear) {
                return Response.json({ status: "FAILED", message: "Duplicated rank !" }, { status: 409 })
            }
        }
        const updateQuery = `UPDATE Ranks
        SET rank_name = ?, rank_price = ?, fiscal_year = ?
        WHERE rank_id = ?`
        await database.execute(updateQuery, [newRankName || rank[0].rank_name, newRankPrice || rank[0].rank_price, newFiscalYear || rank[0].fiscal_year, rankId])
        return Response.json({ status: "SUCCESS", message: "Rank updated successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const { rankId } = await params
        await database.execute("DELETE FROM Ranks WHERE rank_id = ?", [rankId])
        return Response.json({ status: "FAILED", message: "Rank deleted successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}