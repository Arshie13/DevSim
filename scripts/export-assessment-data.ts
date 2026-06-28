// @ts-ignore - Prisma client path
import prisma from "$lib/server/client";
import "dotenv/config";
import { writeFileSync } from "fs";
import { join } from "path";

async function exportData() {
  const users = await prisma.user.findMany({
    include: { assessmentTopicScores: true },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "user_id",
    "email",
    "name",
    "username",
    "xp",
    "coins",
    "level",
    "role",
    "created_at",
    "topic",
    "pre_score",
    "post_score",
    "improvement",
    "assessed_at",
  ];

  const rows: string[] = [headers.join(",")];

  for (const user of users) {
    if (user.assessmentTopicScores.length === 0) {
      rows.push(
        [
          user.id,
          escapeCsv(user.email),
          escapeCsv(user.name),
          escapeCsv(user.username),
          user.xp,
          user.coins,
          user.level,
          user.role,
          user.createdAt.toISOString(),
          "",
          "",
          "",
          "",
          "",
        ].join(","),
      );
    } else {
      for (const score of user.assessmentTopicScores) {
        rows.push(
          [
            user.id,
            escapeCsv(user.email),
            escapeCsv(user.name),
            escapeCsv(user.username),
            user.xp,
            user.coins,
            user.level,
            user.role,
            user.createdAt.toISOString(),
            escapeCsv(score.topic),
            score.pre_score ?? "",
            score.post_score ?? "",
            score.improvement ?? "",
            score.assessed_at.toISOString(),
          ].join(","),
        );
      }
    }
  }

  const outputPath = join(process.cwd(), "assessment_export.csv");
  writeFileSync(outputPath, rows.join("\n"), "utf-8");

  console.log(`Exported ${users.length} users (${rows.length - 1} rows) to ${outputPath}`);
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
