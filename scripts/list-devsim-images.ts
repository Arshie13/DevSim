import Docker from "dockerode";

const docker = new Docker();

async function main() {
  const images = await docker.listImages({ filters: { reference: ["devsim-project:*"] } });

  if (images.length === 0) {
    console.log("No devsim-project images found.");
    return;
  }

  for (const img of images) {
    const tags = img.RepoTags?.filter((t: string) => t.startsWith("devsim-project:")) ?? [];
    for (const tag of tags) {
      const size = (img.Size / 1_000_000).toFixed(1);
      const created = img.Created
        ? new Date(img.Created * 1000).toISOString().split("T")[0]
        : "unknown";
      console.log(`${tag.padEnd(60)} ${size.padStart(6)} MB  ${created}`);
    }
  }
}

main().catch((err) => {
  console.error("Failed to list images:", err.message);
  process.exit(1);
});
