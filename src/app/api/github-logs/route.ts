// /api/github-logs/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");
  if (!runId) return new Response("Missing runId", { status: 400 });

  const res = await fetch(
    `https://api.github.com/repos/junoocha/WormScans/actions/runs/${runId}/logs`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  // GitHub returns a zip of logs — you can extract or just check status
  // For simplicity, let's just return workflow status
  const statusRes = await fetch(
    `https://api.github.com/repos/junoocha/WormScans/actions/runs/${runId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  const data = await statusRes.json();

  return new Response(
    JSON.stringify({
      finished: data.status === "completed",
      logs: [], // optional: extract logs from zip if you want
      images: [], // optional: fetch artifact if available
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
