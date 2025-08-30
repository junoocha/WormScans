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
  // 1️⃣ Insert chapter
  const chapterRes = await fetch("/api/addNewChapter", {
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

  // 2️⃣ Insert images
  const keptImages = images.filter((_, i) => !deletedIndices.has(i));
  const imagesRes = await fetch("/api/addChapterImages", {
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
      const res = await fetch("/api/checkSeriesExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series_name: seriesName }),
      });
      const result = await res.json();
      if (result.exists)
        throw new Error(`Series "${seriesName}" already exists.`);

      // insert new series via API
      const seriesRes = await fetch("/api/addNewSeries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series_name: seriesName,
          series_desc: seriesDescription,
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

    const chapterCheckRes = await fetch("/api/checkChapterExists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        series_id: seriesId,
        chapter_number: chapterNumber,
      }),
    });
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
