"use client";

import React, { useState, useEffect } from "react";
import SeriesDropdown from "@/components/adminSeriesDropdown";

export default function ScrapeMultiplePage() {
  const [chapterUrls, setChapterUrls] = useState(""); // multi-line input
  const [startChapter, setStartChapter] = useState(1); // starting chapter number
  const [logs, setLogs] = useState<string[]>([]);
  const [chapterImages, setChapterImages] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);

  const [existingSeriesList, setExistingSeriesList] = useState<
    { id: string; series_name: string }[]
  >([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  const [selectedChapter, setSelectedChapter] = useState<number>(0); // for dropdown

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch("/api/getSeries");
        const result = await response.json();
        if (response.ok && result.data) {
          const sorted = [...result.data].sort((a, b) =>
            a.series_name.localeCompare(b.series_name)
          );
          setExistingSeriesList(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch series:", err);
      }
    };
    fetchSeries();
  }, []);

  const handleScrapeMultiple = () => {
    const urls = chapterUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (!selectedSeriesId) {
      alert("Please select a series.");
      return;
    }
    if (urls.length === 0) {
      alert("Please enter at least one chapter URL.");
      return;
    }

    setLoading(true);
    setLogs([]);
    setChapterImages([]);
    setSelectedChapter(0);

    const urlParam = encodeURIComponent(urls.join(","));
    const eventSource = new EventSource(
      `/api/scrapeMultiple/manuallyPutChapters?urls=${urlParam}`
    );

    // Prepare an array with empty arrays for each chapter
    const imagesByChapter: string[][] = urls.map(() => []);

    eventSource.onmessage = (event) => {
      const message = event.data;
      setLogs((prev) => [...prev, message]);

      // Match chapter number from the backend message
      const chapterMatch = message.match(/\[Chapter (\d+)\]/);
      if (!chapterMatch) return;

      const chapterIndex = Number(chapterMatch[1]) - 1; // zero-based
      // Match grabbed images
      const urlMatch = message.match(/Grabbed \d+ picture[s]?: (.+)$/);
      if (urlMatch) {
        imagesByChapter[chapterIndex].push(urlMatch[1]);
      }

      // Detect finished scraping
      if (message.includes("Finished scraping")) {
        // Update state immutably
        setChapterImages((prev) => {
          const copy = [...prev];
          copy[chapterIndex] = imagesByChapter[chapterIndex];
          return copy;
        });
        setLogs((prev) => [
          ...prev,
          `=== Finished chapter ${startChapter + chapterIndex} ===`,
        ]);
      }
    };

    eventSource.addEventListener("end", () => {
      eventSource.close();
      setLoading(false);
      setLogs((prev) => [...prev, "\nAll chapters scraped!"]);
    });

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, "Error scraping chapters."]);
      eventSource.close();
      setLoading(false);
    };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scrape Multiple Chapters</h1>

      {/* Series Dropdown */}
      <div className="mb-4">
        <SeriesDropdown
          seriesList={existingSeriesList}
          selectedSeriesId={selectedSeriesId}
          setSelectedSeriesId={setSelectedSeriesId}
          placeholder="Select a series..."
        />
      </div>

      {/* Chapter URLs input */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Chapter URLs (one per line)
        </label>
        <textarea
          rows={6}
          className="border rounded w-full p-2"
          value={chapterUrls}
          onChange={(e) => setChapterUrls(e.target.value)}
          placeholder="https://example.com/ch2\nhttps://example.com/ch3\nhttps://example.com/ch4"
        />
      </div>

      {/* Start Chapter Number */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Start Chapter Number</label>
        <input
          type="number"
          min={1}
          className="border rounded p-2 w-32"
          value={startChapter}
          onChange={(e) => setStartChapter(Number(e.target.value || 1))}
        />
      </div>

      {/* Scrape button */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleScrapeMultiple}
          disabled={loading}
        >
          {loading ? "Scraping..." : "Start Scraping"}
        </button>
      </div>

      {/* Logs */}
      <div className="bg-black text-green-400 p-3 rounded text-sm mb-4 h-48 overflow-y-auto whitespace-pre-wrap font-mono">
        {logs.length === 0 && <p className="opacity-50">Waiting for logs...</p>}
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      {/* Chapter selection */}
      {chapterImages.length > 0 && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Chapter</label>
          <select
            className="border rounded p-2 bg-[var(--card-bg)]"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(Number(e.target.value))}
          >
            {chapterImages.map((_, idx) => (
              <option key={idx} value={idx}>
                Chapter {startChapter + idx}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Images for selected chapter */}
      {chapterImages[selectedChapter] && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Chapter {startChapter + selectedChapter}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {chapterImages[selectedChapter].map((src, imgIndex) => (
              <img
                key={imgIndex}
                src={src}
                alt={`Chapter ${startChapter + selectedChapter} img ${
                  imgIndex + 1
                }`}
                className="rounded shadow border-2 border-blue-500"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
