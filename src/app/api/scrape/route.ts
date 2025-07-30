// src/app/api/scrape/route.ts
import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing URL", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const pythonProcess = spawn("python", ["scraper/playwright_scraper.py"], {
        env: {
          ...process.env,
          TARGET_URL: url,
          PYTHONPATH: path.join(process.cwd()), // ✅ Fix for import error
        },
      });

      pythonProcess.stdout.on("data", (data: Buffer) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim() === "") continue;

          // SSE format
          controller.enqueue(`data: ${line}\n\n`);
        }
      });

      pythonProcess.stderr.on("data", (data: Buffer) => {
        const line = data.toString().trim();
        controller.enqueue(`data: [stderr] ${line}\n\n`);
      });

      pythonProcess.on("close", () => {
        controller.enqueue("event: done\ndata: complete\n\n");
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
};
