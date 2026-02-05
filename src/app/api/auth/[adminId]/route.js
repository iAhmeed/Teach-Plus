import { database } from "@/lib/mysql"

export async function GET(req, {params}) {
    try {
        const {adminId} = await params
        const [admin] = await database.execute("SELECT * FROM Admins WHERE admin_id = ?", [adminId])
        if (!admin.length) {
            return Response.json({status : "FAILED", message : "Admin not found !"}, {status : 404})
        }
        return Response.json({status : "SUCCESS", message : "Admin found successfully !", admin : admin[0]}, {status : 200})
    } catch(err) {
        return Response.json({status : "FAILED", message : err.message}, {status : 500})
    }
}