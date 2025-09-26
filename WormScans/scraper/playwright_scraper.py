# scraper/playwright_scraper.py

import random
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
import os
import sys
sys.dont_write_bytecode = True

# import the scaper modules. Prob more in the future
from scraper.domains import fallback, asurascans

# list of fake user agents to rotate for stealth purposes
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/114.0.1823.51",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:115.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
]

# mimic viewport sizes / different devices
VIEWPORTS = [
    (1366, 768),    # common laptop
    (1920, 1080),   # full HD
    (1440, 900),    # MacBook Air / some laptops
    (1536, 864),    # mid-range laptop
]

# domain checker, yeah will be more later
SITE_MAP = {
    "asuracomic.net": asurascans,
    "asurascans.com": asurascans,
}

# flush output to terminal so can see logs in real time.
def print_flush(*args, **kwargs):
    print(*args, **kwargs) #args for positional arguments passed, kwargs is cor keyword agruments
    sys.stdout.flush() # immediately write output to website terminal

def scrape_images(url, use_lazy=False):

    # break down url into components, get domain, then pick specific scraper
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")
    scraper = SITE_MAP.get(domain, fallback)

    # launch playwright
    with sync_playwright() as p:

        # headless mode
        browser = p.chromium.launch(headless=True)

        # randomize fingerprint
        user_agent = random.choice(USER_AGENTS)
        viewport_width, viewport_height = random.choice(VIEWPORTS)

        # setup the context for browser
        context = browser.new_context(
            user_agent=user_agent,
            viewport={"width": viewport_width, "height": viewport_height}
        )
        print_flush(f"[*] Using user agent: {user_agent}")
        print_flush(f"[*] Using viewport size: {viewport_width}x{viewport_height}")

        # create a new tab
        page = context.new_page()

        print_flush(f"\n[*] Navigating to URL: {url}")

        # load page, wait for DOM to finish
        page.goto(url, wait_until="domcontentloaded", timeout=15000)

        # page.screenshot(path="manhuaus_debug.png", full_page=True)  # this provides a picture for debugging

        print_flush(f"[*] Scraping domain: {domain}")

        # call specific logic for scraping
        if scraper is fallback:
            image_urls = scraper.scrape(page, url, use_lazy=use_lazy)
        else:
            image_urls = scraper.scrape(page, url)

        # log each image
        for i, src in enumerate(image_urls, 1):
            if i == 1:
                print_flush(f"Grabbed {i} picture: {src}")
            else:
                print_flush(f"Grabbed {i} pictures: {src}")

        print_flush("Worm has wormed goodbye.")
        browser.close()

# cli entry point if script is directly run
if __name__ == "__main__":
    target_url = os.getenv("TARGET_URL") or input("Paste chapter URL: ").strip()
    use_lazy = os.getenv("USE_LAZY", "false").lower() == "true" 
    
    scrape_images(target_url, use_lazy)