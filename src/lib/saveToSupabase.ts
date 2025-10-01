// lib/saveToSupabase.ts

interface SaveOptions {
  seriesOption: "new" | "existing";
  seriesName: string;
  seriesDescription: string;
  selectedSeriesId?: string;
  chapterNumber: string;
  chapterTitle?: string;
  images: string[];
  deletedIndices: Set<number>;
  coverFile?: File;
  status?: string; // NEW
  countryOrigin?: string;
}

// helper: insert chapter + images via API routes
async function insertChapterWithImagesAPI(
  seriesId: string,
  chapterNumber: string,
  chapterTitle: string | undefined,
  images: string[],
  deletedIndices: Set<number>
) {
  // set image constants
  const keptImages = images.filter((_, i) => !deletedIndices.has(i));
  const chapterCover =
    keptImages[Math.floor(Math.random() * keptImages.length)];

  // insert chapter
  const chapterRes = await fetch("/api/addData/addNewChapter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      series_id: seriesId,
      chapter_number: chapterNumber,
      title: chapterTitle || null,
      chapter_cover_url: chapterCover,
    }),
  });

  const chapterData = await chapterRes.json();
  if (!chapterRes.ok)
    throw new Error(chapterData.error || "Failed to insert chapter");
  const chapterId = chapterData.data.id;

  // insert images
  const imagesRes = await fetch("/api/addData/addChapterImages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapter_id: chapterId, image_urls: keptImages }),
  });

  const imagesData = await imagesRes.json();
  if (!imagesRes.ok)
    throw new Error(imagesData.error || "Failed to insert images");

  return chapterId;
}

export async function handleSaveToSupabase({
  seriesOption,
  seriesName,
  seriesDescription,
  selectedSeriesId,
  chapterNumber,
  chapterTitle,
  images,
  deletedIndices,
  coverFile,
  status = "ongoing",
  countryOrigin = "japan",
}: SaveOptions) {
  try {
    //  make sure chapter number and images are valid
    if (!chapterNumber.trim()) {
      throw new Error("Chapter number cannot be empty.");
    }
    if (!/^\d+(\.\d+)?$/.test(chapterNumber.trim())) {
      throw new Error("Chapter number must be numeric.");
    }
    const keptImages = images.filter((_, i) => !deletedIndices.has(i));
    if (keptImages.length === 0) {
      throw new Error("Cannot save chapter without images.");
    }

    let seriesId: string;
    let coverUrl: string | null = null;

    if (seriesOption === "new") {
      if (!seriesName.trim()) throw new Error("Please provide a series name");

      // check if series already exists
      const res = await fetch("/api/checkExistence/checkSeriesExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series_name: seriesName }),
      });
      const result = await res.json();
      if (result.exists)
        throw new Error(`Series "${seriesName}" already exists.`);

      // generate slug
      const slug = seriesName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // spaces → dash
        .replace(/[^a-z0-9\-]/g, ""); // remove invalid chars

      // upload cover file for new series
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        formData.append("slug", slug);

        const uploadRes = await fetch("/api/addData/uploadCover", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.coverUrl) {
          throw new Error(uploadData.error || "Failed to upload cover");
        }

        coverUrl = uploadData.coverUrl;
      }

      // insert new series via API
      const seriesRes = await fetch("/api/addData/addNewSeries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_name: seriesName,
          series_desc: seriesDescription,
          slug,
          cover_url: coverUrl,
          series_status: status,
          country_origin: countryOrigin,
        }),
      });

      const seriesData = await seriesRes.json();
      if (!seriesRes.ok)
        throw new Error(seriesData.error || "Failed to insert series");

      seriesId = seriesData.data.id;
    } else {
      if (!selectedSeriesId)
        throw new Error("Please select an existing series");
      seriesId = selectedSeriesId;
    }

    const chapterCheckRes = await fetch(
      "/api/checkExistence/checkChapterExists",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_id: seriesId,
          chapter_number: chapterNumber,
        }),
      }
    );
    const chapterCheckData = await chapterCheckRes.json();

    if (chapterCheckData.exists) {
      throw new Error(
        `Chapter ${chapterNumber} already exists for this series (ID: ${chapterCheckData.chapterId}).`
      );
    }

    // insert chapter + images
    await insertChapterWithImagesAPI(
      seriesId,
      chapterNumber,
      chapterTitle,
      images,
      deletedIndices
    );

    return { success: true };
  } catch (err) {
    // console.error("Save error:", err); uncomment this to see the next js console
    if (err instanceof Error) return { success: false, error: err.message };
    return { success: false, error: String(err) };
  }
}
