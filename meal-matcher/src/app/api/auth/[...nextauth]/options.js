import NextAuth, { NextAuthOptions } from "next-auth"
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";


console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
console.log("GITHUB_ID:", process.env.GITHUB_ID);
console.log("GITHUB_SECRET:", process.env.GITHUB_SECRET);

export const options = { 
    session:{
        strategy: "jwt",
    },

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
                    type: "password", 
                    placeholder: "Enter Password"
                }
            }, 
            async authorize(credentials) {
                // This is where you need to retrieve user data 
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                          username: credentials?.username,
                        },
                      })
                      const isMatch = await bcrypt.compare(credentials?.password, user.passwordHash);
                      if(!isMatch || !user) {
                        throw new Error("Something wrong with password or username..")
                      }
                      return user;
                } catch(error) {
                    console.error("error with authorizing user:", error);
                    throw new error("error with authorizing user:", error);
                }
            }
        })
    ], 
    secret: process.env.NEXTAUTH_SECRET, 
    callbacks: {
        async redirect({ url, baseUrl }) {
          return "/home";
        },
      },


}