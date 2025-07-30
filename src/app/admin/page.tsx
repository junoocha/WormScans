"use client";

import React, { useState } from "react";

export default function ScrapePage() {
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScrape = () => {
    if (!url.trim()) {
      setLogs(["Error: Please enter a URL"]);
      return;
    }

    setLoading(true);
    setLogs([]);
    setImages([]);

    const eventSource = new EventSource(
      `/api/scrape?url=${encodeURIComponent(url)}`
    );

    eventSource.onmessage = (event) => {
      const message = event.data;

      if (message.startsWith("Error:")) {
        // Show error and close stream early
        setLogs((prev) => [...prev, message]);
        eventSource.close();
        setLoading(false);
        return;
      }

      setLogs((prev) => [...prev, message]);

      const urlMatch = message.match(/Grabbed \d+ picture[s]?: (.+)$/);
      if (urlMatch) {
        setImages((prev) => [...prev, urlMatch[1]]);
      }
    };

    eventSource.addEventListener("end", () => {
      eventSource.close();
      setLoading(false);
    });

    eventSource.onerror = (err) => {
      setLogs((prev) => [
        ...prev,
        "Error: Connection lost/failed or you didn't put in a proper website",
      ]);
      eventSource.close();
      setLoading(false);
    };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧹 Web Scraper Admin</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Enter chapter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleScrape}
          disabled={loading}
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </div>

      <div className="bg-black text-green-400 p-3 rounded text-sm mb-4 h-48 overflow-y-auto whitespace-pre-wrap font-mono">
        {logs.length === 0 && <p className="opacity-50">Waiting for logs...</p>}
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`img-${i}`}
            className="rounded shadow border-2 border-blue-500"
          />
        ))}
      </div>
    </div>
  );
}
