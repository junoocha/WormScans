// /api/scrapeMultiple/manuallyPutChapters/route.ts
import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lazyFlag = searchParams.get("lazy") ?? "true";

  // Expect URLs as comma-separated string
  const urlsParam = searchParams.get("urls");
  if (!urlsParam) return new Response("Missing 'urls' query", { status: 400 });

  const urls = urlsParam
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  if (urls.length === 0)
    return new Response("No valid URLs provided", { status: 400 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        controller.enqueue(
          encoder.encode(`data: [Chapter ${i + 1}] Starting scrape: ${url}\n\n`)
        );

        // spawn Python scraper for each URL
        await new Promise<void>((resolve) => {
          const python = spawn(
            "python",
            ["-u", "scraper/playwright_scraper.py"],
            {
              env: {
                ...process.env,
                TARGET_URL: url,
                USE_LAZY: lazyFlag,
                PYTHONPATH: path.join(process.cwd()),
              },
            }
          );

          python.stdout.on("data", (data) => {
            const lines = data.toString().split("\n");
            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(
                  encoder.encode(`data: [Chapter ${i + 1}] ${line}\n\n`)
                );
              }
            }
          });

          python.stderr.on("data", (data) => {
            const lines = data.toString().split("\n");
            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(
                  encoder.encode(`data: [Chapter ${i + 1}][stderr] ${line}\n\n`)
                );
              }
            }
          });

          python.on("close", () => resolve());
        });

        controller.enqueue(
          encoder.encode(`data: [Chapter ${i + 1}] Finished scraping.\n\n`)
        );
      }

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
