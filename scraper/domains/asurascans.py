# scraper/sites/asurascans.py

from scraper.playwright_utils import simulate_human_behavior

def scrape(page, url):
    print("[*] Using AsuraScans-specific scraper")

    # wait until network is idle / no new requests. Then pretend to be human lol
    # page.goto(url, wait_until="networkidle")
    simulate_human_behavior(page)

    # waiting for any image to actually be on the page
    print("[*] Waiting for chapter images to load...")
    page.wait_for_selector("img.object-cover")

    # grab all images
    images = page.query_selector_all("img.object-cover")

    seen_srcs = set() # avoid duplicates with set
    valid_images = [] # then store it all here

    # go through all images that were grabbed
    for index, img in enumerate(images):

        # get image source and filter based on the routing of these images
        src = img.get_attribute("src") or ""
        if not src.startswith("https://gg.asuracomic.net/storage/media/"):
            continue

        # avoid duplicates. if not just add it to the set
        if src in seen_srcs:
            continue
        seen_srcs.add(src)

        #  use size filter to exclude small thumbnails or suggested series images
        try:
            box = img.bounding_box()
            if box and box["height"] > 400 and box["width"] > 300:
                valid_images.append((index, src))
        except Exception:
            # if bounding box fails, keep it anyway
            valid_images.append((index, src))

    # sort by order of appearance in DOM
    valid_images.sort(key=lambda tup: tup[0])

    # extract only urls
    final_images = [src for _, src in valid_images]

    print(f"[*] Retained {len(final_images)} valid chapter images.")
    return final_images
