"use client";

import React, { useState, useEffect } from "react";

interface ChapterUrlGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (urls: string[], startChapter: number) => void;
}

export default function ChapterUrlGeneratorModal({
  isOpen,
  onClose,
  onConfirm,
}: ChapterUrlGeneratorModalProps) {
  const [sampleUrl, setSampleUrl] = useState("");
  const [detectedNumbers, setDetectedNumbers] = useState<
    { value: string; index: number }[]
  >([]);
  const [selectedNumberIdx, setSelectedNumberIdx] = useState<number | null>(
    null
  );
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(1);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

  useEffect(() => {
    // detect numbers in sampleUrl
    const regex = /\d+/g;
    const matches = [...sampleUrl.matchAll(regex)].map((m) => ({
      value: m[0],
      index: m.index ?? 0,
    }));
    setDetectedNumbers(matches);
    setSelectedNumberIdx(matches.length > 0 ? 0 : null);
  }, [sampleUrl]);

  useEffect(() => {
    if (selectedNumberIdx === null || detectedNumbers.length === 0) {
      setGeneratedUrls([]);
      return;
    }
    const urls: string[] = [];
    const targetNumber = detectedNumbers[selectedNumberIdx].value;
    for (let i = startChapter; i <= endChapter; i++) {
      let newUrl = sampleUrl;
      let count = 0;
      newUrl = newUrl.replace(/\d+/g, (match) => {
        if (match === targetNumber && count === 0) {
          count++;
          return i.toString();
        }
        return match;
      });
      urls.push(newUrl);
    }
    setGeneratedUrls(urls);
  }, [sampleUrl, selectedNumberIdx, startChapter, endChapter, detectedNumbers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80  flex justify-center items-start pt-20 z-50">
      <div className="bg-[var(--card-bg)] text-white rounded-2xl shadow-lg p-6 w-full max-w-2xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Generate Chapter URLs</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Sample URL</label>
          <input
            type="text"
            className="border rounded w-full p-2 bg-[var(--card-bg)] text-white border-gray-600"
            value={sampleUrl}
            onChange={(e) => setSampleUrl(e.target.value)}
            placeholder="https://example.com/manga/series/ch40"
          />
        </div>

        {detectedNumbers.length > 0 && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Select number to replace (chapter number)
            </label>
            <div className="flex flex-wrap gap-2">
              {detectedNumbers.map((num, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 rounded border ${
                    selectedNumberIdx === idx
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-[var(--card-bg)] border-gray-600 hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedNumberIdx(idx)}
                >
                  {num.value}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex gap-4">
          <div>
            <label className="block mb-1 font-medium">Start Chapter</label>
            <input
              type="number"
              min={1}
              className="border rounded p-2 w-32 bg-[var(--card-bg)] text-white border-gray-600"
              value={startChapter}
              onChange={(e) => setStartChapter(Number(e.target.value || 1))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">End Chapter</label>
            <input
              type="number"
              min={startChapter}
              className="border rounded p-2 w-32 bg-[var(--card-bg)] text-white border-gray-600"
              value={endChapter}
              onChange={(e) =>
                setEndChapter(Number(e.target.value || startChapter))
              }
            />
          </div>
        </div>

        {generatedUrls.length > 0 && (
          <div className="mb-4 max-h-60 overflow-y-scroll border rounded p-2 bg-black text-green-400 font-mono text-sm">
            {generatedUrls.map((url, idx) => (
              <div key={idx}>{url}</div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              onConfirm(generatedUrls, startChapter);
              onClose();
            }}
            disabled={generatedUrls.length === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
