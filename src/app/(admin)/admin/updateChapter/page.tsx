"use client";

import { useEffect, useState } from "react";
import SeriesDropdown from "@/components/adminSeriesDropdown";
import ChapterCard from "@/components/chapterCard";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
  // state for series dropdown list and the selected list
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");

  // state for chapter dropdown list and the selected chapter list
  const [chapterList, setChapterList] = useState<ChapterOption[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  // state for chapter details, the descp
  const [details, setDetails] = useState<ChapterDetails | null>(null);

  // state for other chapter details + images
  const [chapterNumber, setChapterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // loading state for save/delete
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // set of deleted image indices
  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());

  // index of selected cover image + the url for that cover
  const [chapterCoverIndex, setChapterCoverIndex] = useState<number | null>(
    null
  );
  const [chapterCoverUrl, setChapterCoverUrl] = useState<string | null>(null);

  // Fetch series dropdown
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

  // Fetch chapters when a series is selected
  useEffect(() => {
    // yeah show nothing if no bueno
    if (!selectedSeriesId) {
      setChapterList([]);
      setSelectedChapterId("");
      setDetails(null);
      return;
    }

    // ok but go time we do some api fetchin yaya. but mostly grabbin all the chapters of the series
    fetch(`/api/admin/getSeriesDetails/${selectedSeriesId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data?.chapters) {
          setChapterList(
            res.data.chapters
              .map((ch: any) => ({
                id: ch.id,
                chapter_number: ch.chapter_number,
                title: ch.title,
              }))
              .sort(
                (a: ChapterOption, b: ChapterOption) =>
                  b.chapter_number - a.chapter_number
              )
          );
        }
      })
      .catch((err) => console.error("Error fetching chapters:", err));
  }, [selectedSeriesId]);

  // Fetch chapter details when selected, like the actual chapter details
  useEffect(() => {
    if (!selectedChapterId) return;

    // gogogo fetch it all
    fetch(`/api/admin/getChapterDetails/${selectedChapterId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          const imgs = res.data.chapter_images?.[0]?.image_urls || [];
          setDetails({
            id: res.data.id,
            chapter_number: res.data.chapter_number,
            title: res.data.title,
            image_urls: imgs,
          });
          setChapterNumber(res.data.chapter_number.toString());
          setTitle(res.data.title || "");
          setImages(imgs);

          // Reset cover selection
          setChapterCoverIndex(null);

          // Normalize DB cover
          const dbCover = res.data.chapter_cover_url;
          setChapterCoverUrl(dbCover && dbCover.trim() !== "" ? dbCover : null);
        }
      })
      .catch((err) => console.error("Error fetching chapter details:", err));
  }, [selectedChapterId]);

  // Toggle delete image
  const toggleDeleteImage = (index: number) => {
    setDeletedIndices((prev) => {
      const copy = new Set(prev);
      if (copy.has(index)) copy.delete(index);
      else copy.add(index);
      return copy;
    });
  };

  // save chapter changes
  const handleSave = async () => {
    if (!details) return;
    if (!/^\d+$/.test(chapterNumber)) {
      toast.error("Chapter number must be numeric");
      return;
    }
    // prevent dupe chapter numbers at least before updating details
    const duplicate = chapterList.find(
      (ch) =>
        ch.chapter_number.toString() === chapterNumber.trim() &&
        ch.id !== details.id
    );
    if (duplicate) {
      toast.error(`Chapter ${chapterNumber} already exists in this series`);
      return;
    }

    const safeTitle = title.trim();
    setSaveLoading(true);

    // set the images to be kept + the cover url
    const keptImages = images.filter((_, i) => !deletedIndices.has(i));
    const coverUrl =
      chapterCoverIndex !== null ? keptImages[chapterCoverIndex] : undefined;

    // now we update once we get past those stuff
    try {
      const res = await fetch(`/api/admin/updateChapter/${details.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_number: parseInt(chapterNumber, 10),
          title: safeTitle || null,
          image_urls: keptImages,
          chapter_cover_url: coverUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      toast.success("Chapter updated successfully!", { duration: 7000 });
      setDetails({
        ...details,
        chapter_number: parseInt(chapterNumber, 10),
        title: safeTitle || null,
        image_urls: keptImages,
      });
      setImages(keptImages);
      setDeletedIndices(new Set());
      setChapterCoverIndex(null);
    } catch (err: any) {
      toast.error("Error saving chapter: " + (err.message || err), {
        duration: 10000,
      });
    } finally {
      //ok button you can stop circling now
      setSaveLoading(false);
    }
  };

  // delete chapter
  const handleDeleteChapter = async () => {
    if (!details) return;
    if (
      !confirm(
        // lets first make a confirmation
        `Are you sure you want to delete Chapter ${details.chapter_number}?`
      )
    )
      return;

    setDeleteLoading(true);

    // delete the whole chapter when green light
    try {
      const res = await fetch(`/api/admin/deleteChapter/${details.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      toast.success("Chapter deleted successfully!", { duration: 7000 });
      setChapterList((prev) => prev.filter((ch) => ch.id !== details.id));
      setSelectedChapterId("");
      setDetails(null);
      setChapterNumber("");
      setTitle("");
      setImages([]);
      setDeletedIndices(new Set());
      setChapterCoverIndex(null);
    } catch (err: any) {
      toast.error("Error deleting chapter: " + (err.message || err), {
        duration: 10000,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Chapter</h1>

      {/* series dropdwon */}
      <SeriesDropdown
        seriesList={seriesList}
        selectedSeriesId={selectedSeriesId}
        setSelectedSeriesId={setSelectedSeriesId}
        placeholder="Select a series"
      />

      {/* chapter dropdown */}
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

      {/* chapter details seciton */}
      {details && (
        <div className="space-y-4">
          {/* Chapter Card Preview */}
          <div className="hidden sm:block">
            <ChapterCard
              seriesSlug="preview"
              chapterNumber={chapterNumber}
              title={title}
              images={images}
              chapterCoverUrl={
                chapterCoverIndex !== null
                  ? images[chapterCoverIndex]
                  : chapterCoverUrl || undefined
              }
            />
          </div>
          {/* Chapter Number & Title */}
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

          {/* Images Grid */}
          <div>
            <label className="block mb-1">Images</label>
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((src, i) => {
                  const isDeleted = deletedIndices.has(i);
                  const isCover = chapterCoverIndex === i;

                  // all the images can be deleted + set as the chapter cover
                  return (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt={`Page ${i + 1}`}
                        className={`rounded shadow border-4 w-full object-cover cursor-pointer ${
                          isDeleted
                            ? "border-red-500 opacity-60" // deleted
                            : isCover
                            ? "border-green-500" // chosen cover
                            : "border-blue-500" // regular lol
                        }`}
                        onClick={() => setChapterCoverIndex(i)}
                      />

                      {/* each image is straight up the button so you just lcick on it ya */}
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
          </div>

          {/* action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded flex items-center gap-2"
            >
              {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleDeleteChapter}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded flex items-center gap-2"
            >
              {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {deleteLoading ? "Deleting..." : "Delete Chapter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
