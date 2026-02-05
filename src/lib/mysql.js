import mysql from "mysql2/promise";

let database;
try {
  database = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "local",
    dateStrings: true,
  });
  console.log("MySQL Database Connected Successfully !");
} catch (error) {
  console.error("MySQL Connection Failed: ", error);
  process.exit(1); // Exit the application if the connection fails
}

export { database };