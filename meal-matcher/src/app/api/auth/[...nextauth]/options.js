import NextAuth, { NextAuthOptions } from "next-auth"
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db";


console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
console.log("GITHUB_ID:", process.env.GITHUB_ID);
console.log("GITHUB_SECRET:", process.env.GITHUB_SECRET);

export const options = { 
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }), 
        CredentialsProvider({
            name: "Credentials", 
            credentials: {
                username: {
                    label: "Username:",
                    type: "text", 
                    placeholder: "Enter Username"
                }, 
                password: {
                    label: "Password", 
                    type: "text", 
                    placeholder: "Enter Password"
                }
            }, 
            async authorize(credentials) {
                // This is where you need to retrieve user data 
                // to verify with credentials. This is where the database will go. Not a permanent solution just 
                // a palceholder. 
                // Docs: https://next-auth.js.org/configuration/providers/credentials
                const user = { id: "42", name: "Dave", password: "nextauth" }

                // FOR WHEN ACCESS FOR PRISMA URL IS AVAILABLE IN ENV..

                // const user = await prisma.user.findUnique({
                //     where: {
                //       email: 'elsa@prisma.io',
                //     },
                //   })
                if (credentials?.username === user.name && credentials?.password === user.password) {
                    return user
                } else {
                    return null
                }
            }
        })
    ], 
    secret: process.env.NEXTAUTH_SECRET, 
}