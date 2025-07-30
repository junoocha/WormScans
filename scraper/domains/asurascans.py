# scraper/sites/asurascans.py

from scraper.playwright_utils import simulate_human_behavior

def scrape(page, url):
    print("[*] Using AsuraScans-specific scraper")
    page.goto(url, wait_until="networkidle")
    simulate_human_behavior(page)

    page.wait_for_selector("img.object-cover")

    print("[*] Now the worm shall consume some images... give it some time...")

    images = page.query_selector_all("img.object-cover")

    return [
        img.get_attribute("src")
        for img in images
        if "/storage/media/" in (img.get_attribute("src") or "")
    ]
