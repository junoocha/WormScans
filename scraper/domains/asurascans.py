# scraper/sites/asurascans.py

from scraper.playwright_utils import simulate_human_behavior

def scrape(page, url):
    print("[*] Using AsuraScans-specific scraper")
    page.goto(url, wait_until="networkidle")
    simulate_human_behavior(page)

    print("[*] Waiting for chapter images to load...")
    page.wait_for_selector("img.object-cover")

    images = page.query_selector_all("img.object-cover")

    seen_srcs = set()
    valid_images = []

    for index, img in enumerate(images):
        src = img.get_attribute("src") or ""
        if not src.startswith("https://gg.asuracomic.net/storage/media/"):
            continue

        # Avoid duplicates
        if src in seen_srcs:
            continue
        seen_srcs.add(src)

        # Optionally, use size filter to exclude small thumbnails
        try:
            box = img.bounding_box()
            if box and box["height"] > 400 and box["width"] > 300:
                valid_images.append((index, src))
        except Exception:
            # If bounding box fails, keep it anyway
            valid_images.append((index, src))

    # Sort by DOM order
    valid_images.sort(key=lambda tup: tup[0])

    final_images = [src for _, src in valid_images]

    print(f"[*] Retained {len(final_images)} valid chapter images.")
    return final_images
