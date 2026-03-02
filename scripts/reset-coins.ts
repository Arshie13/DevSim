import prisma from "../src/lib/server/client";

async function resetCoins(userId: string, amount: number = 1000) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { coins: amount },
    });
    console.log(`Successfully reset coins for user ${userId} to ${amount}`);
    console.log(`User: ${user.email}, Coins: ${user.coins}`);
  } catch (error) {
    console.error("Failed to reset coins:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get user ID from command line argument
const userId = process.argv[2];
if (!userId) {
  console.error("Please provide a user ID: npx tsx scripts/reset-coins.ts <userId>");
  process.exit(1);
}

resetCoins(userId, 1000);
