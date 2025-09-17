"use client";

import React, { useState, useEffect } from "react";
import SeriesDropdown from "@/components/adminSeriesDropdown";
import ChapterUrlGeneratorModal from "@/components/generateUrlFromInput";

export default function ScrapeMultiplePage() {
  const [chapterUrls, setChapterUrls] = useState("");
  const [startChapter, setStartChapter] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [chapterImages, setChapterImages] = useState<string[][]>([]);
  const [deletedIndicesByChapter, setDeletedIndicesByChapter] = useState<
    Set<number>[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [existingSeriesList, setExistingSeriesList] = useState<
    { id: string; series_name: string }[]
  >([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [lockedStartChapter, setLockedStartChapter] = useState(startChapter);

  const [isUrlGeneratorOpen, setIsUrlGeneratorOpen] = useState(false);

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
    setDeletedIndicesByChapter([]); // reset deletes
    setSelectedChapter(0);
    setLockedStartChapter(startChapter);

    const urlParam = encodeURIComponent(urls.join(","));
    const eventSource = new EventSource(
      `/api/scrapeMultiple/manuallyPutChapters?urls=${urlParam}`
    );

    const imagesByChapter: string[][] = urls.map(() => []);
    const deletesByChapter = urls.map(() => new Set<number>());
    setChapterImages(urls.map(() => []));
    setDeletedIndicesByChapter(urls.map(() => new Set<number>()));
    const totalChapters = urls.length;

    eventSource.onmessage = (event) => {
      const rawMessage = event.data; // preserve the original message
      let message = rawMessage; // message we can transform

      const chapterMatch = rawMessage.match(/\[Chapter (\d+)\]/);
      if (!chapterMatch) return;

      const chapterIndex = Number(chapterMatch[1]) - 1;

      // rewrite chapter reference to include total
      message = message.replace(
        /\[Chapter \d+\]/,
        `[Chapter ${lockedStartChapter + chapterIndex}/${
          lockedStartChapter + totalChapters - 1
        }]`
      );

      const urlRegex = /Grabbed \d+ picture[s]?: (.+)$/;
      const urlMatch = urlRegex.exec(message);
      if (urlMatch) {
        imagesByChapter[chapterIndex].push(urlMatch[1]);
      }

      setLogs((prev) => [...prev, message]);

      if (rawMessage.includes("Finished scraping")) {
        setChapterImages((prev) => {
          const copy = [...prev];
          copy[chapterIndex] = imagesByChapter[chapterIndex];
          return copy;
        });
        setDeletedIndicesByChapter((prev) => {
          const copy = [...prev];
          copy[chapterIndex] = deletesByChapter[chapterIndex];
          return copy;
        });
        setLogs((prev) => [
          ...prev,
          `=== Finished chapter ${lockedStartChapter + chapterIndex}/${
            lockedStartChapter + totalChapters - 1
          } ===`,
        ]);
      }
    };

    eventSource.addEventListener("end", () => {
      eventSource.close();
      setLoading(false);
      setLogs((prev) => [
        ...prev,
        "\nAll chapters scraped! Worm sleeping now.",
      ]);
    });

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, "Error scraping chapters."]);
      eventSource.close();
      setLoading(false);
    };
  };

  const toggleDelete = (chapterIdx: number, imgIdx: number) => {
    setDeletedIndicesByChapter((prev) => {
      const copy = [...prev];
      const set = new Set(copy[chapterIdx] || []);
      if (set.has(imgIdx)) {
        set.delete(imgIdx);
      } else {
        set.add(imgIdx);
      }
      copy[chapterIdx] = set;
      return copy;
    });
  };

  const resetDeleted = (chapterIdx: number) => {
    setDeletedIndicesByChapter((prev) => {
      const copy = [...prev];
      copy[chapterIdx] = new Set();
      return copy;
    });
  };

  const resetAllDeleted = () => {
    if (
      window.confirm(
        "This will reset ALL deleted images across ALL chapters. Continue?"
      )
    ) {
      setDeletedIndicesByChapter((prev) => prev.map(() => new Set()));
    }
  };

  const handleUploadMultiple = async () => {
    if (!selectedSeriesId) {
      alert("Please select a series.");
      return;
    }

    const chaptersToUpload = chapterImages.map((images, idx) => ({
      chapter_number: lockedStartChapter + idx,
      images: imagesDeletedIndicesRemoved(idx),
    }));

    try {
      const res = await fetch("/api/addData/addMultipleChapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: selectedSeriesId,
          chapters: chaptersToUpload,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      let msg = "All chapters uploaded successfully!";
      if (result.skipped.length) {
        msg += `\nNotice: these chapters were skipped due to already existing: ${result.skipped.join(
          ", "
        )}`;
      }
      alert(msg);
    } catch (err) {
      console.error(err);
      alert(
        "Upload failed: " + (err instanceof Error ? err.message : String(err))
      );
    }
  };

  // helper to remove deleted indices for chapter
  const imagesDeletedIndicesRemoved = (chapterIdx: number) => {
    const deletedSet = deletedIndicesByChapter[chapterIdx] || new Set<number>();
    return chapterImages[chapterIdx].filter((_, i) => !deletedSet.has(i));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scrape Multiple Chapters</h1>

      <div className="mb-4">
        <SeriesDropdown
          seriesList={existingSeriesList}
          selectedSeriesId={selectedSeriesId}
          setSelectedSeriesId={setSelectedSeriesId}
          placeholder="Select a series..."
        />
      </div>

      <div className="mb-4">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 mb-4 rounded bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setChapterUrls("")}
          >
            Clear All URLs
          </button>
          <button
            className="px-4 py-2 mb-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setIsUrlGeneratorOpen(true)}
          >
            Generate Links From URL
          </button>
        </div>
        <label className="block mb-1 font-medium">
          Chapter URLs (one per line and consecutive)
        </label>
        <textarea
          rows={6}
          className="border rounded w-full p-2"
          value={chapterUrls}
          onChange={(e) => setChapterUrls(e.target.value)}
          placeholder={`https://example.com/ch2
https://example.com/ch3
https://example.com/ch4`}
        />
      </div>

      {/* Modal integration */}
      <ChapterUrlGeneratorModal
        isOpen={isUrlGeneratorOpen}
        onClose={() => setIsUrlGeneratorOpen(false)}
        onConfirm={(urls, startChapterFromModal) => {
          setChapterUrls(urls.join("\n"));
          setStartChapter(startChapterFromModal);
        }}
      />

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

      <div className="bg-black text-green-400 p-3 rounded text-sm mb-4 h-70 overflow-y-scroll whitespace-pre-wrap font-mono">
        {logs.length === 0 && <p className="opacity-50">Waiting for logs...</p>}
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

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
                Chapter {lockedStartChapter + idx}
              </option>
            ))}
          </select>
        </div>
      )}

      {chapterImages[selectedChapter] && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Chapter {lockedStartChapter + selectedChapter}
          </h2>
          <button
            onClick={() => resetDeleted(selectedChapter)}
            className="px-3 py-2 mb-4 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Reset Deleted
          </button>

          <button
            onClick={resetAllDeleted}
            className="px-3 py-2 mx-4 mb-4 text-sm rounded bg-red-600 hover:bg-red-800 text-white"
          >
            Reset ALL Deleted
          </button>

          <button
            onClick={handleUploadMultiple}
            disabled={chapterImages.length === 0}
            className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 text-white"
          >
            Save All Chapters
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {chapterImages[selectedChapter].map((src, imgIdx) => {
              const isDeleted =
                deletedIndicesByChapter[selectedChapter]?.has(imgIdx);
              return (
                <img
                  key={imgIdx}
                  src={src}
                  alt={`Chapter ${lockedStartChapter + selectedChapter} img ${
                    imgIdx + 1
                  }`}
                  onClick={() => toggleDelete(selectedChapter, imgIdx)}
                  className={`rounded shadow border-4 cursor-pointer ${
                    isDeleted ? "border-red-500 opacity-60" : "border-blue-500"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
