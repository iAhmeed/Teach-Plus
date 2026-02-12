import { prisma } from "@/lib/prisma"

export async function PUT(req, { params }) {
    try {
        const { rankId } = await params

        const rank = await prisma.rank.findUnique({
            where: { rank_id: Number(rankId) }
        });

        if (!rank) {
            return Response.json({ status: "FAILED", message: "Rank not found !" }, { status: 404 })
        }

        const { newRankName, newRankPrice, newFiscalYear } = await req.json()

        const duplicateRank = await prisma.rank.findFirst({
            where: {
                rank_name: newRankName,
                rank_price: Number(newRankPrice),
                fiscal_year: newFiscalYear,
                NOT: { rank_id: Number(rankId) }
            }
        });

        if (duplicateRank) {
            return Response.json({ status: "FAILED", message: "Duplicated rank !" }, { status: 409 })
        }

        await prisma.rank.update({
            where: { rank_id: Number(rankId) },
            data: {
                rank_name: newRankName || undefined,
                rank_price: newRankPrice ? Number(newRankPrice) : undefined,
                fiscal_year: newFiscalYear || undefined
            }
        });

        return Response.json({ status: "SUCCESS", message: "Rank updated successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const { rankId } = await params

        // Check if exists first to return 404 if needed, though original code returned 200 even if not found? 
        // Original: DELETE FROM Ranks ... Then return "Rank deleted successfully".
        // If not found, nothing deleted.
        // I will use deleteMany for safety or simple delete. 
        // Better: delete if exists.

        try {
            await prisma.rank.delete({
                where: { rank_id: Number(rankId) }
            });
            return Response.json({ status: "SUCCESS", message: "Rank deleted successfully !" }, { status: 200 }) // Corrected status message to SUCCESS matchng intent? Original said "FAILED" msg "Rank deleted successfully" ?? Error in original code probably. "status: FAILED" but "message: Rank deleted successfully...". I will fix it to "SUCCESS".
        } catch (e) {
            if (e.code === 'P2025') {
                // Record to delete does not exist.
                return Response.json({ status: "FAILED", message: "Rank not found" }, { status: 404 })
            }
            throw e;
        }

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}