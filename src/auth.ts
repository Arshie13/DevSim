import { SvelteKitAuth } from "@auth/sveltekit";
import Google from "@auth/sveltekit/providers/google";
import prisma from "$lib/server/client";
import { DEFAULT_AVATARS } from "$lib/utils/avatar";

/** Returns true if the given image string is a local DevSim avatar path. */
function isLocalAvatar(image: string | null | undefined): boolean {
  return typeof image === "string" && image.startsWith("/avatars/");
}

/** Picks a random default avatar path to assign to brand-new users. */
function randomDefaultAvatarPath(): string {
  const idx = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[idx].path;
}

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
          // New user: use OAuth image if provided, otherwise assign a random default avatar
          const imageToStore = randomDefaultAvatarPath();
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              image: imageToStore,
            },
          });
        } else {
          // Determine whether to update the image:
          // - If DB image is null/empty → fill with OAuth image or a new default avatar
          // - If DB image is a local avatar path → the user chose it; don't overwrite
          // - If DB image is an OAuth URL → update from the latest OAuth data
          let newImage: string | undefined;
          if (!existingUser.image) {
            newImage = user.image ?? randomDefaultAvatarPath();
          } else if (user.image && !isLocalAvatar(existingUser.image)) {
            newImage = user.image;
          }

          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name || existingUser.name,
              ...(newImage ? { image: newImage } : {}),
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
      // On initial sign-in, load the DB user to get their ID and stored image.
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.image = dbUser.image;
        }
      }

      // Fallback: resolve via profile email if token.id is still missing.
      if (!token.id && profile?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
          select: { id: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.image = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (token.id) session.user.id = token.id as string;
        // Surface the DB image (may be an OAuth URL or a local /avatars/ path)
        if (token.image !== undefined) {
          session.user.image = token.image as string | null;
        }
      }
      return session;
    },
  },
});
