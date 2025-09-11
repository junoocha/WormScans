"use client";

import React, { useState } from "react";
import { handleSaveToSupabase } from "@/lib/saveToSupabase";

export default function ScrapePage() {
  // input, logs, streaming images
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // for the webscraping button

  // lazy load toggle + disabling for domains
  const [lazyLoad, setLazyLoad] = useState(false);
  const knownDomains = ["asuracomic.net", "asurascans.com"];
  const isKnownDomain = knownDomains.some((d) => url.includes(d));

  // trim imputs + mark indices as deleted
  const [removeFront, setRemoveFront] = useState(0);
  const [removeBack, setRemoveBack] = useState(0);
  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());

  // for recording chapter number/ title
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");

  // state for series selection
  const [seriesOption, setSeriesOption] = useState<"new" | "existing">("new");
  const [seriesName, setSeriesName] = useState("");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [existingSeriesList, setExistingSeriesList] = useState<
    { id: string; series_name: string }[]
  >([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");

  // for cover upload
  const [coverFile, setCoverFile] = useState<File | undefined>();

  // status for ongoing and type
  const [status, setStatus] = useState("ongoing");
  const [countryOrigin, setCountryOrigin] = useState("japan");

  // Fetch existing series when the page loads
  React.useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch("/api/getSeries");
        const result = await response.json();

        if (response.ok && result.data) {
          setExistingSeriesList(result.data);
        } else {
          console.error("Failed to fetch series:", result.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchSeries();
  }, []);

  const handleScrape = () => {
    if (!url.trim()) {
      setLogs(["Error: Please enter a URL"]);
      return;
    }

    // get some states ready
    setLoading(true);
    setLogs([]);
    setImages([]);
    setDeletedIndices(new Set());

    // sse to stream scraper logs and image urls
    const eventSource = new EventSource(
      `/api/scrape?url=${encodeURIComponent(url)}&lazy=${lazyLoad}`
    );

    // show messages
    eventSource.onmessage = (event) => {
      const message = event.data;

      // if scraper sends error, display and stop
      if (message.startsWith("Error:")) {
        setLogs((prev) => [...prev, message]);
        eventSource.close();
        setLoading(false);
        return;
      }

      // add log messages to the state
      setLogs((prev) => [...prev, message]);

      // if image grabbed image url, we add it to images array
      const urlMatch = message.match(/Grabbed \d+ picture[s]?: (.+)$/);
      if (urlMatch) {
        setImages((prev) => [...prev, urlMatch[1]]);
      }
    };

    // signal for end + trim stuff
    eventSource.addEventListener("end", () => {
      eventSource.close();
      setLoading(false);

      if (removeFront > 0 || removeBack > 0) {
        applyTrimOnce();
      }
    });

    // sse issues
    eventSource.onerror = (err) => {
      setLogs((prev) => [
        ...prev,
        "Error: Connection lost/failed or you didn't put in a proper website",
      ]);
      eventSource.close();
      setLoading(false);
    };
  };

  // trim thing
  const applyTrimOnce = () => {
    // update state and new empty set
    setDeletedIndices((_) => {
      const toDelete = new Set<number>();
      const total = images.length;

      // clamp values so they don’t exceed bounds
      const front = Math.max(0, Math.min(removeFront, total));
      const back = Math.max(0, Math.min(removeBack, total - front));

      for (let i = 0; i < front; i++) toDelete.add(i); // forward loop
      for (let i = Math.max(total - back, 0); i < total; i++) toDelete.add(i); // backward loop

      return toDelete;
    });
  };

  // optional: manual apply (user can change numbers after scrape and re-apply)
  const handleApplyTrimClick = () => {
    applyTrimOnce();
  };

  // optional: reset trims to “keep all”
  const handleResetTrimClick = () => {
    setDeletedIndices(new Set());
    setRemoveFront(0);
    setRemoveBack(0);
  };

  const handleClick = async () => {
    const result = await handleSaveToSupabase({
      seriesOption,
      seriesName,
      seriesDescription,
      selectedSeriesId,
      chapterNumber,
      chapterTitle,
      images,
      deletedIndices,
      coverFile,
      status,
      countryOrigin,
    });

    if (result.success) {
      alert("Saved successfully!");
    } else {
      alert("Failed to save: " + result.error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4"> Web Scraper Admin</h1>

      <div className="mb-4 flex gap-4 items-center">
        <label>
          <input
            type="radio"
            value="new"
            checked={seriesOption === "new"}
            onChange={() => setSeriesOption("new")}
          />
          New Series
        </label>

        <label>
          <input
            type="radio"
            value="existing"
            checked={seriesOption === "existing"}
            onChange={() => setSeriesOption("existing")}
          />
          Existing Series
        </label>
      </div>

      {seriesOption === "new" ? (
        <div className="flex flex-col gap-2 mb-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Series Name"
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2"
            placeholder="Series Description"
            value={seriesDescription}
            onChange={(e) => setSeriesDescription(e.target.value)}
          />

          {/* Status dropdown */}
          <label className="text-sm font-medium">Status</label>
          <select
            className="border rounded px-3 py-2 bg-[var(--card-bg)] text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>

          {/* Country of Origin dropdown */}
          <label className="text-sm font-medium">Country of Origin</label>
          <select
            className="border rounded px-3 py-2 bg-[var(--card-bg)] text-white"
            value={countryOrigin}
            onChange={(e) => setCountryOrigin(e.target.value)}
          >
            <option value="japan">Japan</option>
            <option value="korea">Korea</option>
            <option value="china">China</option>
          </select>

          {/* Cover upload */}
          <label className="text-sm mb-1">Series Cover (optional)</label>

          {/* hidden input */}
          <input
            type="file"
            id="cover-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setCoverFile(file);
            }}
          />

          {/* styled button */}
          <label
            htmlFor="cover-upload"
            className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded cursor-pointer w-fit"
          >
            Upload Cover
          </label>

          {/* preview if chosen */}
          {coverFile && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Selected:</p>
              <img
                src={(() => {
                  const url = URL.createObjectURL(coverFile);
                  // cleanup when component unmounts
                  const revoke = () => URL.revokeObjectURL(url);
                  setTimeout(revoke, 0); // defer to next tick
                  return url;
                })()}
                alt="Cover preview"
                className="w-32 h-44 object-cover rounded shadow"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <select
            className="border rounded bg-[var(--card-bg)] px-3 py-2"
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
          >
            <option value="">Select series...</option>
            {existingSeriesList.map((series) => (
              <option key={series.id} value={series.id}>
                {series.series_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* url input + scrape button */}
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

      {/* lazy load toggle because its so slow bro */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="lazyToggle"
          checked={lazyLoad}
          disabled={isKnownDomain}
          onChange={() => setLazyLoad(!lazyLoad)}
        />
        <label htmlFor="lazyToggle" className="text-sm">
          Enable Lazy Loading Scroll
        </label>
      </div>

      {/* chapter details */}
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-50"
          placeholder="Chapter Number"
          value={chapterNumber}
          onChange={(e) => setChapterNumber(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Chapter Title (optional)"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
        />
      </div>

      {/* Trim controls */}
      <div className="flex items-end gap-2 mb-4">
        <div className="flex flex-col">
          <label className="text-xs mb-1">Delete from front</label>
          <input
            type="number"
            min="0"
            className="border rounded px-3 py-1 w-28"
            value={removeFront}
            onChange={(e) => setRemoveFront(Number(e.target.value || 0))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs mb-1">Delete from back</label>
          <input
            type="number"
            min="0"
            className="border rounded px-3 py-1 w-28"
            value={removeBack}
            onChange={(e) => setRemoveBack(Number(e.target.value || 0))}
          />
        </div>
        <button
          className={`px-3 py-2 rounded ${
            images.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 text-white"
          }`}
          onClick={handleApplyTrimClick}
          disabled={images.length === 0}
        >
          Apply Trim
        </button>
        <button
          className={`px-3 py-2 rounded ${
            images.length === 0 && deletedIndices.size === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-600 text-white"
          }`}
          onClick={handleResetTrimClick}
          disabled={images.length === 0 && deletedIndices.size === 0}
        >
          Reset
        </button>

        <button
          className={`px-3 py-2 rounded ${
            images.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white"
          }`}
          onClick={handleClick}
          disabled={images.length === 0}
        >
          Save to Supabase
        </button>
      </div>

      {/* console logs */}
      <div className="bg-black text-green-400 p-3 rounded text-sm mb-4 h-48 overflow-y-auto whitespace-pre-wrap font-mono">
        {logs.length === 0 && <p className="opacity-50">Waiting for logs...</p>}
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      {/* images wooo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((src, i) => {
          // check if its marked for deletion in the set
          const isDeleted = deletedIndices.has(i);
          return (
            <img
              key={i}
              src={src}
              alt={`img-${i}`}
              className={`rounded shadow border-4 ${
                isDeleted ? "border-red-500 opacity-60" : "border-blue-500"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
