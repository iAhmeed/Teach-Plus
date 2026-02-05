import { database } from "@/lib/mysql"

export async function PUT(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")
        const [admin] = await database.execute("SELECT * FROM Admins WHERE admin_id = ?", [authorizedAdminId])
        if (!admin.length) {
            return Response.json({status : "FAILED", message : "Admin not found !"}, {status : 404})
        }
        const {newFirstName, newFamilyName, newPhoneNumber, newDateOfBirth, newDepartment, newAddress, newPicture} = await req.json()
        // phone number must be unique ...
        const [phoneNumbers] = await database.execute("SELECT phone_number from Admins WHERE admin_id != ?", [authorizedAdminId])
        console.log(newPhoneNumber);
        for (const element of phoneNumbers) {
            if (element.phone_number == newPhoneNumber) {
                
                return Response.json({status : "FAILED", message : "Phone Number already used ! Choose another one"}, {status : 400})
            }
        }

        const updateQuery = `UPDATE Admins 
        SET first_name = ?, family_name = ?, phone_number = ?, date_of_birth = ?, department = ?, address = ?, picture = ? 
        WHERE admin_id = ?
        `
        const updateValues = [newFirstName || admin[0].first_name, newFamilyName || admin[0].family_name, newPhoneNumber || admin[0].phone_number, newDateOfBirth || admin[0].date_of_birth, newDepartment || admin[0].department, newAddress || admin[0].address, newPicture || admin[0].picture, authorizedAdminId]
        await database.execute(updateQuery, updateValues)

        return Response.json({status : "SUCCESS", message : "Admin updated successfully !"}, {status : 200})
    } catch(err) {
        return Response.json({status : "FAILED", message : err.message}, {status : 500})
    }
}