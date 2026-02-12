import { prisma } from "@/lib/prisma"

export async function PUT(req) {
    try {
        const authorizedAdminId = req.headers.get("x-admin-id")

        const admin = await prisma.admin.findUnique({
            where: { admin_id: Number(authorizedAdminId) }
        });

        if (!admin) {
            return Response.json({ status: "FAILED", message: "Admin not found !" }, { status: 404 })
        }

        const { newFirstName, newFamilyName, newPhoneNumber, newDateOfBirth, newDepartment, newAddress, newPicture } = await req.json()

        // phone number must be unique ...
        if (newPhoneNumber) {
            const existingPhone = await prisma.admin.findFirst({
                where: {
                    phone_number: newPhoneNumber,
                    NOT: { admin_id: Number(authorizedAdminId) }
                }
            });

            if (existingPhone) {
                return Response.json({ status: "FAILED", message: "Phone Number already used ! Choose another one" }, { status: 400 })
            }
        }

        await prisma.admin.update({
            where: { admin_id: Number(authorizedAdminId) },
            data: {
                first_name: newFirstName || undefined,
                family_name: newFamilyName || undefined,
                phone_number: newPhoneNumber || undefined,
                date_of_birth: newDateOfBirth ? new Date(newDateOfBirth) : undefined,
                department: newDepartment || undefined,
                address: newAddress || undefined,
                picture: newPicture || undefined
            }
        });

        return Response.json({ status: "SUCCESS", message: "Admin updated successfully !" }, { status: 200 })
    } catch (err) {
        return Response.json({ status: "FAILED", message: err.message }, { status: 500 })
    }
}