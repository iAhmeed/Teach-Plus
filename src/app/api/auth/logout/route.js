import { cookies } from "next/headers"

export async function DELETE(req) {
    try {
      (await cookies()).delete("session")
      return Response.json({status : "SUCCESS", message : "Logged Out successfully !"})
    } catch(err) {
      return Response.json({status : "FAILED", message : err.message}, {status : 500})
    }
  }