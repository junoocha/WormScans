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
  // sample url inputted by user
  const [sampleUrl, setSampleUrl] = useState("");

  // list of detected numbers in url + index of each selected number
  const [detectedNumbers, setDetectedNumbers] = useState<
    { value: string; index: number }[]
  >([]);
  const [selectedNumberIdx, setSelectedNumberIdx] = useState<number | null>(
    null
  );

  // start + end chapter input
  const [startChapter, setStartChapter] = useState<string>("1");
  const [endChapter, setEndChapter] = useState<string>("1");

  // list of generated urls
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

  // detect numbers in sample url
  useEffect(() => {
    const regex = /\d+/g;
    const matches = [...sampleUrl.matchAll(regex)].map((m) => ({
      value: m[0],
      index: m.index ?? 0,
    }));
    setDetectedNumbers(matches);
    setSelectedNumberIdx(matches.length > 0 ? 0 : null);
  }, [sampleUrl]);

  // regenerate urls when inputs/selections change for start/end chapters
  useEffect(() => {
    const start = parseInt(startChapter, 10);
    const end = parseInt(endChapter, 10);

    if (
      // when unreasonable inputs are given, display nothing
      selectedNumberIdx === null ||
      detectedNumbers.length === 0 ||
      isNaN(start) ||
      isNaN(end) ||
      end < start
    ) {
      setGeneratedUrls([]);
      return;
    }

    const urls: string[] = [];
    const targetNumber = detectedNumbers[selectedNumberIdx].value;
    for (let i = start; i <= end; i++) {
      // find numbers in url
      let count = 0;
      const newUrl = sampleUrl.replace(/\d+/g, (match) => {
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

  // hide modal if closed
  if (!isOpen) return null;

  // check list before sending input from modals to main page
  const canConfirm =
    generatedUrls.length > 0 &&
    startChapter.trim() !== "" &&
    endChapter.trim() !== "" &&
    !isNaN(parseInt(startChapter, 10)) &&
    !isNaN(parseInt(endChapter, 10)) &&
    parseInt(endChapter, 10) >= parseInt(startChapter, 10);

  // no letters!
  const handleNumberInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Allow empty string or numbers only
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    // the dark overlay
    <div className="fixed inset-0 bg-black/80 flex justify-center items-start sm:items-center sm:pt-0 pt-6 z-50 p-4">
      {/* modal container */}
      <div className="bg-[var(--card-bg)] text-white rounded-2xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">Generate Chapter URLs</h2>

        <div className="overflow-y-auto flex-1 pr-1">
          {/* Sample URL */}
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

          {/* Detected numbers */}
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

          {/* Start and End Chapters stacked */}
          <div className="mb-4 flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Chapter</label>
              <input
                type="text"
                className="border rounded p-2 w-full bg-[var(--card-bg)] text-white border-gray-600"
                value={startChapter}
                onChange={(e) =>
                  handleNumberInput(e.target.value, setStartChapter)
                }
                placeholder="Enter start chapter"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Chapter</label>
              <input
                type="text"
                className="border rounded p-2 w-full bg-[var(--card-bg)] text-white border-gray-600"
                value={endChapter}
                onChange={(e) =>
                  handleNumberInput(e.target.value, setEndChapter)
                }
                placeholder="Enter end chapter"
              />
            </div>
          </div>

          {/* Generated URLs preview */}
          {generatedUrls.length > 0 && (
            <div className="mb-4 max-h-60 overflow-y-auto border rounded p-2 bg-black text-green-400 font-mono text-sm">
              {generatedUrls.map((url, idx) => (
                <div key={idx}>{url}</div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              onConfirm(generatedUrls, parseInt(startChapter, 10));
              onClose();
            }}
            disabled={!canConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
