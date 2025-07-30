# scraper/sites/fallback.py

from scraper.playwright_utils import simulate_human_behavior

def scrape(page, url):
    print("[*] Using fallback scraper (generic)")
    page.goto(url, wait_until="networkidle")
    simulate_human_behavior(page)

    # Wait for image tags to load (not necessarily visible)
    page.wait_for_selector("img", state="attached")

    images = page.query_selector_all("img")

    return [
        img.get_attribute("src")
        for img in images
        if img.get_attribute("src") and img.get_attribute("src").startswith("http")
    ]
