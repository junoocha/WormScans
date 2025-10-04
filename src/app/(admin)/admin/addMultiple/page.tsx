"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import SeriesDropdown from "@/components/adminSeriesDropdown";
import ChapterUrlGeneratorModal from "@/components/generateUrlFromInput";
import ChapterLinkGeneratorModal from "@/components/chapterLinkGenerator";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ScrapeMultiplePage() {
  // text area for urls, chapter number to start, and lazy load option
  const [chapterUrls, setChapterUrls] = useState("");
  const [startChapter, setStartChapter] = useState(1);
  const [lazyLoad, setLazyLoad] = useState(false);

  // array of log messages, container, and setting the autoscroll for logs
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // list of images for each chapter + track deleted images
  const [chapterImages, setChapterImages] = useState<string[][]>([]);
  const [deletedIndicesByChapter, setDeletedIndicesByChapter] = useState<
    Set<number>[]
  >([]);

  // scraping state for the button visibility stuff
  const [loading, setLoading] = useState(false);

  // list of existing series from database and selecting chosen series id
  const [existingSeriesList, setExistingSeriesList] = useState<
    { id: string; series_name: string }[]
  >([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  // currently active chapter index and locking the starting chapter for consistency and prevent users from switching halfway through (could breka)
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [lockedStartChapter, setLockedStartChapter] = useState(startChapter);

  // modal state for url generator and link generator
  const [isUrlGeneratorOpen, setIsUrlGeneratorOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // number of images to trim from front and back
  const [removeFront, setRemoveFront] = useState(0);
  const [removeBack, setRemoveBack] = useState(0);

  // to show supabase upload button is working
  const [saving, setSaving] = useState(false);

  // if run on localhost or vercel
  const isLocal = !process.env.NEXT_PUBLIC_VERCEL;

  // prevent save to supabase button from prematurely being able to click
  const allChaptersScraped = chapterImages.length > 0 && !loading;
  const canSave = selectedSeriesId !== "" && allChaptersScraped;

  // fetch available series on mount
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

  // handle scraping multiple chapters from urls
  const handleScrapeMultiple = (currentLazy = lazyLoad) => {
    if (!isLocal) {
      toast.error(
        "Multi-Scraping is disabled on the live site due to limiting features. Please run locally."
      );
      return;
    }
    const urls = chapterUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (!selectedSeriesId) {
      toast.error("Please select a series.");
      return;
    }
    if (urls.length === 0) {
      toast.error("Please enter at least one chapter URL.");
      return;
    }

    setLoading(true);
    setLogs([]);
    setChapterImages([]);
    setDeletedIndicesByChapter([]); // reset deletes
    setSelectedChapter(0);
    setLockedStartChapter(startChapter);

    // pass urls and lazy  flag to backend scrape api
    const urlParam = encodeURIComponent(urls.join(","));
    const eventSource = new EventSource(
      `/api/scrapeMultiple/manuallyPutChapters?urls=${urlParam}&lazy=${currentLazy}`
    );

    const imagesByChapter: string[][] = urls.map(() => []);
    const deletesByChapter = urls.map(() => new Set<number>());
    setChapterImages(urls.map(() => []));
    setDeletedIndicesByChapter(urls.map(() => new Set<number>()));
    const totalChapters = urls.length;

    // handle server-sent events with scraping progress
    eventSource.onmessage = (event) => {
      // preserve original message, then set another variable that can transform message
      const rawMessage = event.data;
      let message = rawMessage;

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

      // extract image url from message
      const urlRegex = /Grabbed \d+ picture[s]?: (.+)$/;
      const urlMatch = urlRegex.exec(message);
      if (urlMatch) {
        imagesByChapter[chapterIndex].push(urlMatch[1]);
      }

      setLogs((prev) => [...prev, message]);

      // update state/logs message when finishing one chapter
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

    // telling logs that the whole process is finished
    eventSource.addEventListener("end", () => {
      eventSource.close();
      setLoading(false);
      setLogs((prev) => [
        ...prev,
        "\nAll chapters scraped! Worm sleeping now.",
      ]);
    });

    // log error message
    eventSource.onerror = () => {
      setLogs((prev) => [...prev, "Error scraping chapters."]);
      eventSource.close();
      setLoading(false);
    };
  };

  // toggle a single image's delete flag
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

  // reset deleted images for one chapters
  const resetDeleted = (chapterIdx: number) => {
    setDeletedIndicesByChapter((prev) => {
      const copy = [...prev];
      copy[chapterIdx] = new Set();
      return copy;
    });
  };

  // reset deleted images for all chapters
  const resetAllDeleted = () => {
    if (
      window.confirm(
        // warning
        "This will reset ALL deleted images across ALL chapters. Continue?"
      )
    ) {
      setDeletedIndicesByChapter((prev) => prev.map(() => new Set()));
    }
  };

  // supabase upload all the chapters
  const handleUploadMultiple = async () => {
    if (!selectedSeriesId) {
      toast.error("Please select a series.");
      return;
    }

    setSaving(true);

    // Build chapter payload, but filter out ones with no images
    const chaptersToUpload: { chapter_number: number; images: string[] }[] = [];
    const skippedEmptyChapters: number[] = [];

    chapterImages.forEach((images, idx) => {
      const cleaned = imagesDeletedIndicesRemoved(idx);
      const chapterNumber = lockedStartChapter + idx;

      if (cleaned.length === 0) {
        skippedEmptyChapters.push(chapterNumber);
      } else {
        chaptersToUpload.push({
          chapter_number: chapterNumber,
          images: cleaned,
        });
      }
    });

    try {
      // upload using api
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

      // Build success message
      let msg = "All chapters uploaded successfully!";

      // Include skipped empty chapters
      if (skippedEmptyChapters.length > 0) {
        msg += `\n\nNotice: these chapters were skipped because they contained no images: ${skippedEmptyChapters.join(
          ", "
        )}`;
      }

      // Include skipped existing chapters from server
      if (result.skipped?.length) {
        msg += `\n\nNotice: these chapters were skipped because they already exist: ${result.skipped.join(
          ", "
        )}`;
      }

      toast.success(msg, {
        duration: 8000,
        style: { whiteSpace: "pre-line" },
      });
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to save: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      // reset state after upload or failure
      setSaving(false);
      setChapterImages([]);
      setDeletedIndicesByChapter([]);
      setLogs([]);
      setSelectedChapter(0);
      setLockedStartChapter(startChapter);
    }
  };

  // helper to remove deleted indices for chapter
  const imagesDeletedIndicesRemoved = (chapterIdx: number) => {
    const deletedSet = deletedIndicesByChapter[chapterIdx] || new Set<number>();
    return chapterImages[chapterIdx].filter((_, i) => !deletedSet.has(i));
  };

  // to help logs scroll automatically
  useLayoutEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // to help logs scroll automatically
  const handleScroll = () => {
    const container = logsContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;

    setAutoScroll(isAtBottom);
  };

  // apply trimming of images across all chapters
  const applyTrimAll = () => {
    setDeletedIndicesByChapter((prev) => {
      const updated = prev.map((_, chapterIdx) => {
        const toDelete = new Set<number>();
        const total = chapterImages[chapterIdx]?.length || 0;

        const front = Math.max(0, Math.min(removeFront, total));
        const back = Math.max(0, Math.min(removeBack, total - front));

        for (let i = 0; i < front; i++) toDelete.add(i);
        for (let i = Math.max(total - back, 0); i < total; i++) toDelete.add(i);

        return toDelete;
      });
      return updated;
    });
  };

  // reset trim inputs and deleted sets
  const resetTrimAll = () => {
    setDeletedIndicesByChapter((prev) => prev.map(() => new Set<number>()));
    setRemoveFront(0);
    setRemoveBack(0);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scrape Multiple Chapters</h1>

      {/* dropdown to select series */}
      <div className="mb-4">
        <SeriesDropdown
          seriesList={existingSeriesList}
          selectedSeriesId={selectedSeriesId}
          setSelectedSeriesId={setSelectedSeriesId}
          placeholder="Select a series..."
        />
      </div>

      {/* url input and modal triggers */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          {/* clear all urls */}
          <button
            className="w-full sm:w-auto px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setChapterUrls("")}
          >
            Clear All URLs
          </button>

          {/* generate urls from urls */}
          <button
            className="w-full sm:w-auto px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setIsUrlGeneratorOpen(true)}
          >
            Generate Links From URL
          </button>

          {/* generate urls from main series page */}
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
          >
            Generate from Series Page
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

      <ChapterLinkGeneratorModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onConfirm={(urls, startChapterFromModal) => {
          setChapterUrls(urls.join("\n")); // fill textarea
          setStartChapter(startChapterFromModal); // update start chapter
        }}
      />

      {/* input for start chapter */}
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

      {/* lazy Load Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="lazyToggleMulti"
          checked={lazyLoad}
          onChange={() => setLazyLoad(!lazyLoad)}
          className="cursor-pointer"
        />
        <label htmlFor="lazyToggleMulti" className="text-sm cursor-pointer">
          Enable Lazy Loading Scroll
        </label>
      </div>

      {/* scrape button */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={() => handleScrapeMultiple(lazyLoad)}
          disabled={loading}
        >
          {loading ? "Scraping..." : "Start Scraping"}
        </button>
      </div>

      {/* logs */}
      <div
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="bg-black text-green-400 p-3 rounded text-sm mb-4 h-48 overflow-y-auto  overflow-x-hidden whitespace-pre-wrap font-mono"
      >
        {logs.length === 0 && <p className="opacity-50">Waiting for logs...</p>}
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      {/* chapter select dropdown */}
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

      {/* chapter viewer */}
      {chapterImages[selectedChapter] && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Chapter {lockedStartChapter + selectedChapter}
          </h2>
          {/* prev / Next + Reset  row*/}
          <div className="flex flex-col sm:flex-row mb-5 gap-2">
            {/* Prev / Next buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() =>
                  setSelectedChapter((prev) => Math.max(prev - 1, 0))
                }
                disabled={selectedChapter === 0}
                className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded text-white ${
                  selectedChapter === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                ◀ Prev
              </button>

              <button
                onClick={() =>
                  setSelectedChapter((prev) =>
                    Math.min(prev + 1, chapterImages.length - 1)
                  )
                }
                disabled={selectedChapter === chapterImages.length - 1}
                className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded text-white ${
                  selectedChapter === chapterImages.length - 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Next ▶
              </button>
            </div>

            {/* Reset buttons*/}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => resetDeleted(selectedChapter)}
                className="px-3 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Reset Selected Deleted
              </button>

              <button
                onClick={resetAllDeleted}
                className="px-3 py-2 text-sm rounded bg-red-600 hover:bg-red-800 text-white"
              >
                Reset All Selected Deleted
              </button>
            </div>
          </div>

          {/* Global Trim Controls */}
          <div className="flex flex-col sm:flex-row items-end gap-2 mb-5">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex flex-col flex-1 sm:flex-none">
                <label className="text-xs mb-1">Delete from front</label>
                <input
                  type="number"
                  min="0"
                  className="border rounded px-3 py-1 w-full"
                  value={removeFront}
                  onChange={(e) => setRemoveFront(Number(e.target.value || 0))}
                />
              </div>

              <div className="flex flex-col flex-1 sm:flex-none">
                <label className="text-xs mb-1">Delete from back</label>
                <input
                  type="number"
                  min="0"
                  className="border rounded px-3 py-1 w-full"
                  value={removeBack}
                  onChange={(e) => setRemoveBack(Number(e.target.value || 0))}
                />
              </div>
            </div>

            {/* Trim + Reset buttons*/}
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                className={`flex-1 sm:flex-none px-3 py-2 rounded text-white ${
                  chapterImages.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={applyTrimAll}
                disabled={chapterImages.length === 0}
              >
                Apply Trim
              </button>

              <button
                className={`flex-1 sm:flex-none px-3 py-2 rounded text-white ${
                  chapterImages.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
                onClick={resetTrimAll}
                disabled={chapterImages.length === 0}
              >
                Reset
              </button>
            </div>
          </div>

          {/* save All */}
          <div className="mb-4 flex justify-center sm:justify-start">
            <button
              onClick={handleUploadMultiple}
              disabled={!canSave || saving}
              className={`w-full sm:w-auto px-3 py-2 text-sm rounded text-white flex items-center justify-center gap-2 ${
                canSave && !saving
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {saving && <Loader2 className="animate-spin w-4 h-4" />}
              <span>{saving ? "Saving..." : "Save All Chapters"}</span>
            </button>
          </div>

          {/* show images with toggle delete available */}
          <div className="max-h-[90vh] overflow-y-scroll pr-2 pb-20">
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
                      isDeleted
                        ? "border-red-500 opacity-60"
                        : "border-blue-500"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
