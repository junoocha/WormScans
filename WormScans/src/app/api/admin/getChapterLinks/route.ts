import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) return new Response("Missing 'url' query", { status: 400 });

  const prependBase = searchParams.get("prependBase") ?? "true";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: Starting scrape: ${targetUrl}\n\n`)
      );

      await new Promise<void>((resolve) => {
        const python = spawn(
          "python",
          ["-u", "scraper/scrape_chapter_links.py"],
          {
            env: {
              ...process.env,
              TARGET_URL: targetUrl,
              PREPEND_BASE_URL: prependBase,
              USE_LAZY: "true",
              PYTHONPATH: path.join(process.cwd()),
            },
          }
        );

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

        python.on("close", () => resolve());
      });

      controller.enqueue(encoder.encode("event: end\ndata: done\n\n"));
      controller.close();
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
