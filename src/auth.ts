import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import prisma from "$lib/server/client";

export const { handle } = SvelteKitAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              image: user.image || null,
            },
          });
        } else {
          // Update existing user with latest data
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in - get user ID from database using email
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      // If token.id is not set, try from profile email
      if (!token.id && profile?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
