"use server"
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation"; // ✅ this line is missing


export default async function registerUser(formData) {
    console.log("Registering the user")
    try {
        const firstName = formData.get("first_name");
        const lastName = formData.get("last_name");
        const username = formData.get("username");
        const email = formData.get("email");
        const passwordHash = formData.get("password");

        if (!firstName | !lastName | !username | !email |!passwordHash) {
            throw new Error("one of the feilds is missing");
        }
        const hashedPassword = await bcrypt.hash(passwordHash, 10);

        const user = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                passwordHash: hashedPassword,
            },
        });

        redirect("/");
        // return user;
    } catch (error) {
        if (error?.digest?.includes("NEXT_REDIRECT")) {
            throw error; // Let Next.js handle the redirect
        }
        console.error("error with creating user:", error);
        throw new Error("registration failed(user)");
    }
}
