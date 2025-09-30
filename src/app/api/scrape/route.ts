//api/scrape/route.ts
import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

const isLocal = !process.env.VERCEL;

function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (isLocal) {
    return runLocalScraper(req);
  } else {
    return triggerGitHubScraper(req);
  }
}

async function runLocalScraper(req: NextRequest) {
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
          USE_LAZY: lazyFlag,
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

async function triggerGitHubScraper(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const lazyFlag = searchParams.get("lazy") ?? "true";

  if (!targetUrl) return new Response("Missing URL", { status: 400 });

  // Trigger the workflow
  const dispatchRes = await fetch(
    `https://api.github.com/repos/junoocha/WormScans/actions/workflows/scrape.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { url: targetUrl, lazy: lazyFlag },
      }),
    }
  );

  if (!dispatchRes.ok) {
    const text = await dispatchRes.text();
    return new Response(`Failed to trigger workflow: ${text}`, { status: 500 });
  }

  // Wait a second or two and fetch the most recent run
  await new Promise((r) => setTimeout(r, 2000));

  const runsRes = await fetch(
    `https://api.github.com/repos/junoocha/WormScans/actions/workflows/scrape.yml/runs?per_page=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  if (!runsRes.ok) {
    const text = await runsRes.text();
    return new Response(`Failed to fetch workflow run: ${text}`, {
      status: 500,
    });
  }

  const runsData = await runsRes.json();
  const runId = runsData.workflow_runs?.[0]?.id;

  if (!runId) {
    return new Response("Could not find workflow run ID", { status: 500 });
  }

  // Return the run ID to the frontend so it can poll logs
  return new Response(JSON.stringify({ runId }), {
    headers: { "Content-Type": "application/json" },
  });
}
