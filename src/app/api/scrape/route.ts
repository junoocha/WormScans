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

  // grab url + lazy flag from query string
  const targetUrl = searchParams.get("url");
  const lazyFlag = searchParams.get("lazy") ?? "true"; // default true if not set

  if (!targetUrl || !isValidUrl(targetUrl)) {
    return new Response("Invalid or missing URL", { status: 400 });
  }

  const encoder = new TextEncoder();

  // streaming response
  const stream = new ReadableStream({
    start(controller) {
      // spawn the Python scraper as a child process, unbuffer output with -u, then env vars to give it stuff it needs
      const python = spawn("python", ["-u", "scraper/playwright_scraper.py"], {
        env: {
          ...process.env,
          TARGET_URL: targetUrl,
          USE_LAZY: lazyFlag, // 👈 add lazy flag here
          PYTHONPATH: path.join(process.cwd()),
        },
      });

      // handle Python stdout (normal logs)
      python.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            // prefix with `data:` so SSE can stream it
            controller.enqueue(encoder.encode(`data: ${line}\n\n`));
          }
        }
      });

      // handle Python stderr (errors)
      python.stderr.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: [stderr] ${line}\n\n`));
          }
        }
      });

      // when Python process ends, tell SSE stream to close
      python.on("close", () => {
        controller.enqueue(encoder.encode("event: end\ndata: done\n\n"));
        controller.close();
      });
    },
  });

  // return the stream as an SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
