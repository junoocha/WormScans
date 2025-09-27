"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { handleSaveToSupabase } from "@/lib/saveToSupabase";
import SeriesDropdown from "@/components/adminSeriesDropdown";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ScrapePage() {
  // input, logs, streaming images
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
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

  // to prevent supabase button from prematurely being clickable
  const isNewSeries = seriesOption === "new";
  const canSave =
    !loading && // wait until scraping is fully finished
    images.length > 0 &&
    chapterNumber.trim() !== "" &&
    (isNewSeries
      ? seriesName.trim() !== "" && seriesDescription.trim() !== ""
      : selectedSeriesId !== "");

  // to show supabase upload is working
  const [saving, setSaving] = useState(false);

  // Fetch existing series when the page loads
  React.useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch("/api/getSeries");
        const result = await response.json();

        if (response.ok && result.data) {
          const sorted = [...result.data].sort((a: any, b: any) =>
            a.series_name.localeCompare(b.series_name)
          );
          setExistingSeriesList(sorted);
        } else {
          console.error("Failed to fetch series:", result.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchSeries();
  }, []);

  // stuff after pressing scrape
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
    eventSource.onerror = (_) => {
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

  // after pressing SAVE to SUPABASE
  const handleClick = async () => {
    setSaving(true);
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
      toast.success("Saved successfully!");

      if (seriesOption === "new") {
        // Reset everything except seriesOption
        setSeriesName("");
        setSeriesDescription("");
        setCoverFile(undefined);
        setStatus("ongoing");
        setCountryOrigin("japan");
        setUrl("");
        setChapterNumber("");
        setChapterTitle("");
        setLogs([]);
        setImages([]);
        setDeletedIndices(new Set());
        setRemoveFront(0);
        setRemoveBack(0);
      } else {
        // Existing series: reset only chapter-specific things
        setChapterNumber("");
        setChapterTitle("");
        setImages([]);
        setLogs([]);
        setDeletedIndices(new Set());
        setRemoveFront(0);
        setRemoveBack(0);
      }
    } else {
      toast.error("Failed to save: " + result.error);
    }

    setSaving(false);
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4"> Web Scraper Admin</h1>

      {/* choose between new or existing series when adding chapter */}
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

      {/* new series */}
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

          {/* status dropdown */}
          <label className="text-sm font-medium">Status</label>
          <select
            className="border rounded px-3 py-2 bg-[var(--card-bg)] text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
            <option value="hiatus">Hiatus</option>
          </select>

          {/* country of Origin dropdown */}
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

          {/* cover upload */}
          <label className="text-sm mb-1">Series Cover (optional)</label>

          {/* hidden input for cover */}
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
          <div className="flex w-full sm:w-auto">
            <label
              htmlFor="cover-upload"
              className="flex justify-center items-center w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded cursor-pointer"
            >
              Upload Cover
            </label>
          </div>

          {/* preview if chosen */}
          {coverFile && (
            <div className="mt-2 mb-3">
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
          <SeriesDropdown
            seriesList={existingSeriesList}
            selectedSeriesId={selectedSeriesId}
            setSelectedSeriesId={setSelectedSeriesId}
            placeholder="Select a series..."
          />
        </div>
      )}

      {/* url input + scrape button */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1 mb-1 sm:mb-0"
          placeholder="Enter chapter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded cursor-pointer w-full sm:w-auto"
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
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 w-full md:w-32"
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
      <div className="flex flex-wrap items-end gap-2 mb-4">
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
          className={`px-3 py-2 rounded text-white ${
            images.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          onClick={handleApplyTrimClick}
          disabled={images.length === 0}
        >
          Apply Trim
        </button>

        <button
          className={`px-3 py-2 rounded text-white ${
            images.length === 0 && deletedIndices.size === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
          onClick={handleResetTrimClick}
          disabled={images.length === 0 && deletedIndices.size === 0}
        >
          Reset
        </button>

        <button
          onClick={handleClick}
          disabled={!canSave || saving}
          className={`px-3 py-2 rounded text-white flex items-center justify-center gap-2 ${
            canSave && !saving
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {saving && <Loader2 className="animate-spin w-4 h-4" />}
          <span>{saving ? "Saving..." : "Save Chapter"}</span>
        </button>
      </div>

      {/* console logs */}
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

      {/* images wooo */}
      <div className="max-h-[90vh] overflow-y-scroll pr-2 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((src, i) => {
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
    </div>
  );
}
