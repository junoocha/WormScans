# scraper/playwright_scraper.py

import time
import random
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import os
import sys

from scraper.domains import fallback, asurascans

SITE_MAP = {
    "asuracomic.net": asurascans,
    "asurascans.com": asurascans,
    # Add more domains later here
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
        context = browser.new_context(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/114.0.0.0 Safari/537.36"
        ))
        page = context.new_page()

        print_flush(f"\n[*] Scraping domain: {domain}")
        image_urls = scraper.scrape(page, url)
        for i, src in enumerate(image_urls, 1):
            if i == 1:
                print_flush(f"Grabbed {i} picture: {src}")
            else:
                print_flush(f"Grabbed {i} pictures: {src}")

        # print_flush(f" Found {len(image_urls)} image(s):\n")

        # for src in image_urls:
        #     print_flush(src)

        print_flush("Worm has wormed goodbye.")
        browser.close()

if __name__ == "__main__":
    target_url = os.getenv("TARGET_URL") or input("Paste chapter URL: ").strip()
    scrape_images(target_url)
