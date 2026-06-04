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

/**
 * Check if user has completed pretest by looking for pretest_score on user
 */
async function hasCompletedPretest(userId: string): Promise<boolean> {
  const pretestScores = await prisma.assessment_topic_score.findMany({
    where: {
      user_id: userId,
      pre_score: { not: null },
    },
    take: 1,
  });
  return pretestScores.length > 0;
}

export const { handle } = SvelteKitAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only check if email is present - allow sign in to proceed
      // User creation/update is handled in jwt callback to avoid blocking auth on DB errors
      return !!user.email;
    },
    async jwt({ token, user, account, profile }) {
      // On initial sign-in, create or update user in database
      if (user && user.email) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // New user: use OAuth image if provided, otherwise assign a random default avatar
            const imageToStore = randomDefaultAvatarPath();
            // Generate username from email (remove domain and replace invalid characters)
            const username = user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "User",
                image: imageToStore,
                username: username,
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
        } catch (error) {
          console.error("Error creating/updating user:", error);
          // Don't throw - allow authentication to proceed even if DB operations fail
        }

        // Load the DB user to get their ID and stored image.
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, image: true, username: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.image = dbUser.image;
            token.username = dbUser.username;
            token.givenName = profile?.given_name;
            token.fullName = profile?.name;
            
            // Check if user has completed pretest and store in token
            const hasPretest = await hasCompletedPretest(dbUser.id);
            token.hasCompletedPretest = hasPretest;
          }
        } catch (error) {
          console.error("Error loading user from database:", error);
          // Continue without DB user info if there's an error
        }
      }

      // Fallback: resolve via profile email if token.id is still missing.
      if (!token.id && profile?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
            select: { id: true, image: true, username: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.image = dbUser.image;
            token.username = dbUser.username;
            token.givenName = profile?.given_name;
            token.fullName = profile?.name;
            
            // Check if user has completed pretest and store in token
            const hasPretest = await hasCompletedPretest(dbUser.id);
            token.hasCompletedPretest = hasPretest;
          }
        } catch (error) {
          console.error("Error loading user from database (fallback):", error);
          // Continue without DB user info if there's an error
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.username) session.user.username = token.username as string | null;
        // Surface the DB image (may be an OAuth URL or a local /avatars/ path)
        if (token.image !== undefined) {
          session.user.image = token.image as string | null;
          session.user.name = token.name as string | null;
          session.user.fullName = token.fullName as string | null;
          session.user.givenName = token.givenName as string | null;
        }
        // Pass pretest completion status to the session
        if (token.hasCompletedPretest !== undefined) {
          session.user.hasCompletedPretest = token.hasCompletedPretest as boolean;
        }
      }
      return session;
    },
  },
});
