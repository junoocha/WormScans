"use client";

import { useEffect, useState } from "react";

type SeriesOption = { id: string; series_name: string };
type ChapterOption = {
  id: string;
  chapter_number: number;
  title: string | null;
};
type ChapterDetails = {
  id: string;
  chapter_number: number;
  title: string | null;
  image_urls: string[];
};

export default function UpdateChapterPage() {
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
  const [chapterList, setChapterList] = useState<ChapterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [details, setDetails] = useState<ChapterDetails | null>(null);

  const [chapterNumber, setChapterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());

  // Fetch series dropdown
  useEffect(() => {
    fetch("/api/getSeries")
      .then((res) => res.json())
      .then((res) => setSeriesList(res.data || []))
      .catch((err) => console.error("Error fetching series:", err));
  }, []);

  // Fetch chapters when a series is selected
  useEffect(() => {
    if (!selectedSeriesId) {
      setChapterList([]);
      setSelectedChapterId("");
      setDetails(null);
      return;
    }

    fetch(`/api/admin/getSeriesDetails/${selectedSeriesId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.chapters) {
          setChapterList(
            res.data.chapters.map((ch: any) => ({
              id: ch.id,
              chapter_number: ch.chapter_number,
              title: ch.title,
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching chapters:", err));
  }, [selectedSeriesId]);

  // Fetch chapter details when selected
  useEffect(() => {
    if (!selectedChapterId) return;

    const chapter = chapterList.find(
      (ch) => ch.id.toString() === selectedChapterId
    );
    if (!chapter) return;

    fetch(`/api/admin/getChapterDetails/${selectedChapterId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setDetails({
            id: res.data.id,
            chapter_number: res.data.chapter_number,
            title: res.data.title,
            image_urls: res.data.chapter_images?.[0]?.image_urls || [],
          });
          setChapterNumber(res.data.chapter_number.toString());
          setTitle(res.data.title || "");
          setImages(res.data.chapter_images?.[0]?.image_urls || []);
        }
      })
      .catch((err) => console.error("Error fetching chapter details:", err));
  }, [selectedChapterId]);

  // Remove image by index
  const toggleDeleteImage = (index: number) => {
    setDeletedIndices((prev) => {
      const copy = new Set(prev);
      if (copy.has(index)) {
        copy.delete(index);
      } else {
        copy.add(index);
      }
      return copy;
    });
  };

  const handleSave = async () => {
    if (!details) return;

    // Ensure chapter number is numeric
    if (!/^\d+$/.test(chapterNumber)) {
      setStatus("Chapter number must be numeric");
      return;
    }

    // Ensure no duplicate chapter numbers in the same series
    const duplicate = chapterList.find(
      (ch) =>
        ch.chapter_number.toString() === chapterNumber.trim() &&
        ch.id !== details.id // allow current chapter
    );
    if (duplicate) {
      setStatus(`Chapter ${chapterNumber} already exists in this series`);
      return;
    }

    // Title is optional, but if filled, trim it
    const safeTitle = title.trim();

    setLoading(true);
    setStatus("Saving...");

    const keptImages = images.filter((_, i) => !deletedIndices.has(i));

    const res = await fetch(`/api/admin/updateChapter/${details.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapter_number: parseInt(chapterNumber, 10),
        title: safeTitle || null,
        image_urls: keptImages,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus("Error saving: " + (data.error || "Unknown error"));
    } else {
      setStatus("Chapter updated successfully!");
      setDetails({
        ...details,
        chapter_number: parseInt(chapterNumber, 10),
        title: safeTitle || null,
        image_urls: keptImages,
      });
      setImages(keptImages);
      setDeletedIndices(new Set());
    }

    setLoading(false);
  };

  const handleDeleteChapter = async () => {
    if (!details) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete Chapter ${details.chapter_number}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setLoading(true);
    setStatus("Deleting chapter...");

    try {
      const res = await fetch(`/api/admin/deleteChapter/${details.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("Error deleting chapter: " + (data.error || "Unknown error"));
      } else {
        setStatus("Chapter deleted successfully!");

        // Remove deleted chapter from chapterList
        setChapterList((prev) => prev.filter((ch) => ch.id !== details.id));

        // Clear selected chapter and details
        setSelectedChapterId("");
        setDetails(null);
        setChapterNumber("");
        setTitle("");
        setImages([]);
        setDeletedIndices(new Set());

        // Optionally, show if series now has no chapters
        if (!data.seriesHasChapters) {
          console.log("This series has no chapters left.");
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("Error deleting chapter: " + err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Chapter</h1>

      {/* Series Dropdown */}
      <select
        value={selectedSeriesId}
        onChange={(e) => setSelectedSeriesId(e.target.value)}
        className="w-full mb-4 p-2 bg-[var(--card-bg)] rounded"
      >
        <option value="">Select a series</option>
        {seriesList.map((s) => (
          <option key={s.id} value={s.id}>
            {s.series_name}
          </option>
        ))}
      </select>

      {/* Chapter Dropdown */}
      {chapterList.length > 0 && (
        <select
          value={selectedChapterId}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="w-full mb-6 p-2 bg-[var(--card-bg)] rounded"
        >
          <option value="">Select a chapter</option>
          {chapterList.map((ch) => (
            <option key={ch.id} value={ch.id}>
              Chapter {ch.chapter_number} {ch.title ? `- ${ch.title}` : ""}
            </option>
          ))}
        </select>
      )}

      {/* Chapter details */}
      {details && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Chapter Number</label>
            <input
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card-bg)]"
            />
          </div>

          <div>
            <label className="block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card-bg)]"
            />
          </div>

          <div>
            <label className="block mb-1">Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((src, i) => {
                const isDeleted = deletedIndices.has(i);
                return (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      alt={`Page ${i + 1}`}
                      className={`rounded shadow border-4 w-full object-cover ${
                        isDeleted
                          ? "border-red-500 opacity-60"
                          : "border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleDeleteImage(i)}
                      className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={handleDeleteChapter}
            className="mt-3 ml-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded"
          >
            Delete Chapter
          </button>
        </div>
      )}

      {status && <p className="mt-4 text-sm text-gray-400">{status}</p>}
    </div>
  );
}
