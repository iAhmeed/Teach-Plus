import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const { rankName, rankPrice, fiscalYear } = await req.json();

        if (!rankName || !rankPrice) {
            return Response.json({ status: "FAILED", message: "A required data field is missing" }, { status: 400 })
        }

        const existingRank = await prisma.rank.findFirst({
            where: {
                rank_name: rankName,
                fiscal_year: fiscalYear ? Number(fiscalYear) : null,
                rank_price: Number(rankPrice)
            }
        });

        if (existingRank) {
            return Response.json({ status: "FAILED", message: "This rank already exists" }, { status: 409 })
        }

        await prisma.rank.create({
            data: {
                rank_name: rankName,
                rank_price: Number(rankPrice),
                fiscal_year: fiscalYear ? Number(fiscalYear) : null
            }
        });

        return Response.json({ status: "SUCCESS", message: "Rank added successfully !" }, { status: 200 })

    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const ranks = await prisma.rank.findMany();

        if (!ranks.length) {
            return Response.json({ status: "FAILED", message: "No ranks found !" }, { status: 404 })
        }
        return Response.json({ status: "SUCCESS", message: "Ranks found successfully !", ranks: ranks }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}