"use client";

import { useEffect, useState } from "react";
import SeriesDropdown from "@/components/adminSeriesDropdown";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type SeriesOption = { id: string; series_name: string };
type SeriesDetails = {
  id: string;
  series_name: string;
  series_desc: string | null;
  slug: string;
  cover_url: string | null;
  series_status: string;
  country_origin: string;
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

  const [saveLoading, setSaveLoading] = useState(false);

  const [formStatus, setFormStatus] = useState("ongoing");
  const [countryOrigin, setCountryOrigin] = useState("japan");

  // fetch dropdown series list
  useEffect(() => {
    fetch("/api/getSeries")
      .then((res) => res.json())
      .then((res) => {
        const list: SeriesOption[] = res.data || [];
        list.sort((a, b) => a.series_name.localeCompare(b.series_name));
        setSeriesList(list);
      })
      .catch((err) => console.error("Error fetching series:", err));
  }, []);

  // fetch details when a series is selected
  useEffect(() => {
    if (!selectedSeriesId) return;
    fetch(`/api/admin/getSeriesDetails/${selectedSeriesId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setDetails(res.data);
          setTitle(res.data.series_name || "");
          setDesc(res.data.series_desc || "");
          setFormStatus(res.data.series_status || "ongoing");
          setCountryOrigin(res.data.country_origin || "japan");
          setCoverPreview(null); // reset preview
        }
      })
      .catch((err) => {
        toast.error("Error fetching series details:", err);
      });
  }, [selectedSeriesId]);

  // handle cover change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview(null);
  };

  // handle save
  const handleSave = async () => {
    if (!details) return;

    if (!title.trim()) {
      toast.error("Series title cannot be empty");
      return;
    }
    if (!desc.trim()) {
      toast.error("Series description cannot be empty");
      return;
    }

    const duplicate = seriesList.find(
      (s) =>
        s.series_name.toLowerCase().trim() === title.toLowerCase().trim() &&
        s.id !== details.id
    );
    if (duplicate) {
      toast.error("Another series with this title already exists");
      return;
    }

    setSaveLoading(true);

    let coverUrl = details.cover_url;

    try {
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        formData.append("slug", details.slug);

        const uploadRes = await fetch("/api/addData/uploadCover", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        coverUrl = uploadData.coverUrl;
      }

      const res = await fetch(`/api/admin/updateSeries/${details.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_name: title.trim(),
          series_desc: desc.trim(),
          cover_url: coverUrl,
          series_status: formStatus,
          country_origin: countryOrigin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      setDetails({
        ...details,
        series_name: title.trim(),
        series_desc: desc.trim(),
        cover_url: coverUrl,
      });
      setCoverFile(null);
      setCoverPreview(null);
      toast.success("Series Updated Successfully!");
    } catch (err: any) {
      toast.error("Error saving: " + (err.message || err));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Series</h1>

      {/* Dropdown */}
      <SeriesDropdown
        seriesList={seriesList}
        selectedSeriesId={selectedSeriesId}
        setSelectedSeriesId={setSelectedSeriesId}
        placeholder="Select a series"
      />

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
            <label className="block mb-1">Status</label>
            <select
              className="w-full p-2 rounded bg-[var(--card-bg)]"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Country of Origin</label>
            <select
              className="w-full p-2 rounded bg-[var(--card-bg)]"
              value={countryOrigin}
              onChange={(e) => setCountryOrigin(e.target.value)}
            >
              <option value="japan">Japan</option>
              <option value="korea">Korea</option>
              <option value="china">China</option>
            </select>
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

            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />

            <label
              htmlFor="cover-upload"
              className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded cursor-pointer"
            >
              Change Cover
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="px-4 py-2 bg-green-500 mb-6 hover:bg-green-400 text-black font-semibold rounded flex items-center gap-2"
          >
            {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {saveLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
