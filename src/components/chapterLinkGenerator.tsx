"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

interface ChapterLinkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (urls: string[], startChapter: number) => void;
}

export default function ChapterLinkGeneratorModal({
  isOpen,
  onClose,
  onConfirm,
}: ChapterLinkGeneratorModalProps) {
  const [seriesUrl, setSeriesUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [chapterLinks, setChapterLinks] = useState<string[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [prependBase, setPrependBase] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleScrape = () => {
    if (!seriesUrl) return alert("Enter a series URL.");

    setLoading(true);
    setLogs([]);
    setChapterLinks([]);
    setSelectedLinks(new Set());

    const eventSource = new EventSource(
      `/api/admin/getChapterLinks?url=${encodeURIComponent(
        seriesUrl
      )}&prependBase=${prependBase}`
    );

    eventSource.onmessage = (e) => {
      const raw = e.data;
      setLogs((prev) => [...prev, raw]);

      if (raw.startsWith("Grabbed link: ")) {
        const url = raw.replace("Grabbed link: ", "").trim();
        if (!chapterLinks.includes(url)) {
          setChapterLinks((prev) => [...prev, url]);
          setSelectedLinks((prev) => new Set(prev).add(url));
        }
      }
    };

    eventSource.addEventListener("end", () => {
      eventSource.close();
      setLoading(false);
      setLogs((prev) => [...prev, "All links scraped."]);
    });

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, "Error scraping links."]);
      eventSource.close();
      setLoading(false);
    };
  };

  const toggleSelect = (url: string) => {
    setSelectedLinks((prev) => {
      const copy = new Set(prev);
      if (copy.has(url)) copy.delete(url);
      else copy.add(url);
      return copy;
    });
  };

  const confirmSelection = () => {
    const sortedSelected = sortedLinks
      .filter(({ link }) => selectedLinks.has(link))
      .map(({ link }) => link);
    onConfirm(sortedSelected, 1);
    onClose();
  };

  if (!isOpen) return null;

  const uniqueLinks = Array.from(new Set(chapterLinks));
  const sortedLinks = uniqueLinks
    .map((link, idx) => {
      const match = link.match(/chapter[-_/]?(\d+)/i);
      const chapterNum = match ? parseInt(match[1], 10) : idx;
      return { link, chapterNum };
    })
    .sort((a, b) =>
      sortAsc ? a.chapterNum - b.chapterNum : b.chapterNum - a.chapterNum
    );

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-start sm:items-center sm:pt-0 pt-6 z-50 p-4">
      <div className="bg-[var(--card-bg)] p-6 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col ">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Generate Chapters from Series Page
          <Info className="w-4 h-4 text-gray-400 cursor-pointer">
            <title>
              May not work on all websites. Use prepend only if links look
              weird.
            </title>
          </Info>
        </h2>

        <div className="overflow-y-auto flex-1 pr-1">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Series URL</label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={seriesUrl}
              onChange={(e) => setSeriesUrl(e.target.value)}
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="prependBase"
              checked={prependBase}
              onChange={() => setPrependBase(!prependBase)}
            />
            <label htmlFor="prependBase" className="text-sm">
              Prepend base URL for relative links
            </label>
          </div>

          {chapterLinks.length > 0 && (
            <button
              className="px-2 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white mb-2"
              onClick={() => setSortAsc((prev) => !prev)}
            >
              Sort: {sortAsc ? "Ascending" : "Descending"}
            </button>
          )}

          <div className="mb-4 bg-black/80 text-green-400 p-4 rounded text-sm max-h-40 overflow-y-scroll font-mono whitespace-pre-wrap">
            {logs.length === 0 && (
              <p className="opacity-50">Waiting for logs...</p>
            )}
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>

          {sortedLinks.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Select Chapters</h3>
              <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                {sortedLinks.map(({ link }) => (
                  <button
                    key={link}
                    onClick={() => toggleSelect(link)}
                    className={`p-2 border rounded text-sm text-left break-all ${
                      selectedLinks.has(link)
                        ? "bg-blue-600 text-white"
                        : "bg-[var(--card-bg)]"
                    }`}
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <button
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleScrape}
            disabled={loading}
          >
            {loading ? "Scraping..." : "Start Scraping"}
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              selectedLinks.size === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={confirmSelection}
            disabled={selectedLinks.size === 0}
          >
            Confirm Selection
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
