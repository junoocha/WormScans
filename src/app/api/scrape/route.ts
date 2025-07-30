import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl || !isValidUrl(targetUrl)) {
    return new Response("Invalid or missing URL", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const python = spawn("python", ["-u", "scraper/playwright_scraper.py"], {
        env: {
          ...process.env,
          TARGET_URL: targetUrl,
          PYTHONPATH: path.join(process.cwd()),
        },
      });

      python.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${line}\n\n`));
          }
        }
      });

      python.stderr.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: [stderr] ${line}\n\n`));
          }
        }
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
