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
}

// helper: insert chapter + images via API routes
async function insertChapterWithImagesAPI(
  seriesId: string,
  chapterNumber: string,
  chapterTitle: string | undefined,
  images: string[],
  deletedIndices: Set<number>
) {
  // insert chapter
  const chapterRes = await fetch("/api/addData/addNewChapter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      series_id: seriesId,
      chapter_number: chapterNumber,
      title: chapterTitle || null,
    }),
  });

  const chapterData = await chapterRes.json();
  if (!chapterRes.ok)
    throw new Error(chapterData.error || "Failed to insert chapter");
  const chapterId = chapterData.data.id;

  // insert images
  const keptImages = images.filter((_, i) => !deletedIndices.has(i));
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
}: SaveOptions) {
  try {
    let seriesId: string;

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

      // insert new series via API
      const seriesRes = await fetch("/api/addData/addNewSeries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_name: seriesName,
          series_desc: seriesDescription,
          slug,
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

    //  make sure chapter number and images are valid
    if (!chapterNumber.trim()) {
      throw new Error("Chapter number cannot be empty.");
    }
    if (!/^\d+$/.test(chapterNumber.trim())) {
      throw new Error("Chapter number must be numeric.");
    }
    const keptImages = images.filter((_, i) => !deletedIndices.has(i));
    if (keptImages.length === 0) {
      throw new Error("Cannot save chapter without images.");
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
