"use client";

import { useEffect, useState } from "react";

type SeriesOption = { id: string; series_name: string };
type SeriesDetails = {
  id: string;
  series_name: string;
  series_desc: string | null;
  slug: string;
  cover_url: string | null;
  chapters: {
    id: string;
    chapter_number: number;
    title: string | null;
    created_at: string;
  }[];
};

export default function UpdateSeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
  const [details, setDetails] = useState<SeriesDetails | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // fetch dropdown series list
  useEffect(() => {
    fetch("/api/getSeries")
      .then((res) => res.json())
      .then((res) => setSeriesList(res.data || []))
      .catch((err) => console.error("Error fetching series:", err));
  }, []);

  // fetch details when a series is selected
  useEffect(() => {
    if (!selectedSeriesId) return;
    setStatus("Loading details...");
    fetch(`/api/admin/getSeriesDetails/${selectedSeriesId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setDetails(res.data);
          setTitle(res.data.series_name || "");
          setDesc(res.data.series_desc || "");
          setCoverPreview(null); // reset preview when selecting new series
        }
        setStatus("");
      })
      .catch((err) => {
        console.error("Error fetching series details:", err);
        setStatus("Failed to load details");
      });
  }, [selectedSeriesId]);

  // update preview when a new file is selected
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview(null);
  };

  // handle save
  const handleSave = async () => {
    if (!details) return;
    setLoading(true);
    setStatus("Saving...");

    let coverUrl = details.cover_url;

    if (coverFile) {
      const formData = new FormData();
      formData.append("file", coverFile);
      formData.append("slug", details.slug);

      const uploadRes = await fetch("/api/addData/uploadCover", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setStatus("Error uploading cover: " + uploadData.error);
        setLoading(false);
        return;
      }
      coverUrl = uploadData.coverUrl;
    }

    const res = await fetch(`/api/admin/updateSeries/${details.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        series_name: title,
        series_desc: desc,
        cover_url: coverUrl,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus("Error saving: " + (data.error || "Unknown error"));
    } else {
      setStatus("Series updated successfully!");
      setDetails({
        ...details,
        series_name: title,
        series_desc: desc,
        cover_url: coverUrl,
      });
      setCoverFile(null);
      setCoverPreview(null);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Series</h1>

      {/* Dropdown */}
      <select
        value={selectedSeriesId}
        onChange={(e) => setSelectedSeriesId(e.target.value)}
        className="w-full mb-6 p-2 bg-[var(--card-bg)] rounded"
      >
        <option value="">Select a series</option>
        {seriesList.map((s) => (
          <option key={s.id} value={s.id}>
            {s.series_name}
          </option>
        ))}
      </select>

      {/* Details form */}
      {details && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card-bg)]"
            />
          </div>

          <div>
            <label className="block mb-1">Synopsis</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full p-2 rounded bg-[var(--card-bg)]"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1">Cover Image</label>
            <div className="flex gap-4 mb-2">
              {details.cover_url && !coverPreview && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-400 mb-1">Current</span>
                  <img
                    src={details.cover_url}
                    alt="Current cover"
                    className="w-40 h-56 object-cover rounded"
                  />
                </div>
              )}
              {coverPreview && (
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-400 mb-1">New</span>
                  <img
                    src={coverPreview}
                    alt="New cover preview"
                    className="w-40 h-56 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {status && <p className="mt-4 text-sm text-gray-400">{status}</p>}
    </div>
  );
}
