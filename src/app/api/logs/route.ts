// src/app/api/logs/route.ts
import { spawn } from "child_process";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const python = spawn("python", ["scraper/playwright_scraper.py"], {
        env: { ...process.env, TARGET_URL: url || "" },
      });

      python.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${line}\n\n`));
          }
        }
      });

      python.stderr.on("data", (err) => {
        controller.enqueue(
          encoder.encode(`data: Python error: ${err.toString()}\n\n`)
        );
      });

      python.on("close", () => {
        controller.enqueue(encoder.encode("event: end\ndata: done\n\n"));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
