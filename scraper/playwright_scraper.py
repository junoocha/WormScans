# scraper/playwright_scraper.py
import random
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import os
import sys

from scraper.domains import fallback, asurascans

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/114.0.1823.51",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0",
]

VIEWPORTS = [
    (1366, 768),    # common laptop
    (1920, 1080),   # full HD
    (1440, 900),    # MacBook Air / some laptops
    (1536, 864),    # mid-range laptop
]

SITE_MAP = {
    "asuracomic.net": asurascans,
    "asurascans.com": asurascans,
    # Add more domains here
}

def print_flush(*args, **kwargs):
    print(*args, **kwargs)
    sys.stdout.flush()

def scrape_images(url):
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")
    scraper = SITE_MAP.get(domain, fallback)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        user_agent = random.choice(USER_AGENTS)
        viewport_width, viewport_height = random.choice(VIEWPORTS)

        context = browser.new_context(
            user_agent=user_agent,
            viewport={"width": viewport_width, "height": viewport_height}
        )
        print_flush(f"[*] Using user agent: {user_agent}")
        print_flush(f"[*] Using viewport size: {viewport_width}x{viewport_height}")

        page = context.new_page()

        print_flush(f"\n[*] Navigating to URL: {url}")
        page.goto(url, wait_until="networkidle")

        print_flush(f"[*] Scraping domain: {domain}")
        image_urls = scraper.scrape(page, url)

        for i, src in enumerate(image_urls, 1):
            if i == 1:
                print_flush(f"Grabbed {i} picture: {src}")
            else:
                print_flush(f"Grabbed {i} pictures: {src}")

        print_flush("Worm has wormed goodbye.")
        browser.close()

if __name__ == "__main__":
    target_url = os.getenv("TARGET_URL") or input("Paste chapter URL: ").strip()
    scrape_images(target_url)
