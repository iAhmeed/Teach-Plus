import { database } from "@/lib/mysql";
import bcrypt from "bcrypt"

// Function that checks if the entered email actually exists...
async function isValidEmail(email) {
    const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`);
    const data = await response.json();

    return data.is_valid_format.value && data.deliverability === "DELIVERABLE";
}

export async function POST(req) {
    try {
        const { email, password, firstName, familyName, phoneNumber, dateOfBirth, department, address, picture } = await req.json();

        // Data validation ....
        if ([email, password, firstName, familyName, department].some((data) => data === undefined || data === "")) {
            return Response.json({ status: "FAILED", message: "A required data field is missing!" }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return Response.json({status : "FAILED", message : "This email doesn't exist !"}, {status : 400});
        }
        const nonRequiredData = [phoneNumber, dateOfBirth, address, picture].map(value => value ?? null);

        const [admins] = await database.execute("SELECT * FROM Admins WHERE email = ?", [email])
        if (admins.length) {
            return Response.json({status : "FAILED", message : "Admin already exists !"}, {status : 400})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const insertionQuery = `
            INSERT INTO Admins 
            (email, password_hash, first_name, family_name, phone_number, date_of_birth, address, picture, department, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await database.execute(insertionQuery, [email, hashedPassword, firstName, familyName, ...nonRequiredData, department]);

        return Response.json({ status: "SUCCESS" , message : "Admin created successfully !"}, { status: 200 });

    } catch (error) {
        console.error("Error inserting admin:", error);
        return Response.json({ status: "FAILED", message: error.message }, { status: 500 });
    }
}
