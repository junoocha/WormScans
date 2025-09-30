import { NextRequest } from "next/server";
import AdmZip from "adm-zip";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");
  if (!runId) return new Response("Missing runId", { status: 400 });

  // fetch workflow run info
  const runRes = await fetch(
    `https://api.github.com/repos/junoocha/WormScans/actions/runs/${runId}`,
    { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
  );
  const runData = await runRes.json();
  const finished = runData.status === "completed";

  // fetch artifacts only if finished
  let logs: string[] = [];
  let images: string[] = [];

  if (finished) {
    // list artifacts
    const artifactsRes = await fetch(
      `https://api.github.com/repos/junoocha/WormScans/actions/runs/${runId}/artifacts`,
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
    );
    const artifactsData = await artifactsRes.json();
    const artifact = artifactsData.artifacts.find(
      (a: any) => a.name === "scraped-output"
    );
    if (artifact) {
      // download artifact zip
      const zipRes = await fetch(artifact.archive_download_url, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
      });
      const buffer = Buffer.from(await zipRes.arrayBuffer());
      const zip = new AdmZip(buffer);

      // read log file
      const logEntry = zip.getEntry("output/scraper.log");
      if (logEntry) logs = logEntry.getData().toString().split("\n");

      // read images file
      const imagesEntry = zip.getEntry("output/images.txt");
      if (imagesEntry)
        images = imagesEntry.getData().toString().split("\n").filter(Boolean);
    }
  }

  return new Response(JSON.stringify({ finished, logs, images }), {
    headers: { "Content-Type": "application/json" },
  });
}
