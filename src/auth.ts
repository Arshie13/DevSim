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
    async signIn({ user }) {
      if (!user.email || !user.name) {
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
              name: user.name,
              image: user.image || null,
            },
          });
        } else {
          // Update existing user with latest data
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name,
              image: user.image || null,
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return false;
      }
    },
  },
});
