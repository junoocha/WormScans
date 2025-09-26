import os
import sys
import random
from urllib.parse import urlparse, urljoin
from playwright.sync_api import sync_playwright

# print with flush so logs show immediately
def print_flush(*args, **kwargs):
    print(*args, **kwargs)
    sys.stdout.flush()

# list of user agents to rotate
USER_AGENTS = [
    # windows / chrome
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    # mac / safari
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    # linux / chrome
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    # windows / firefox
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
    # mac / chrome
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    # linux / firefox
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:115.0) Gecko/20100101 Firefox/115.0",
    # ios / safari
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    # android / chrome
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    # ipad / safari
    "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    # windows 11 / edge
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
]

# common viewport sizes to mimic
VIEWPORTS = [
    (1366, 768),
    (1920, 1080),
    (1440, 900),
]

# scrape chapter links from a given URL
def scrape_chapter_links(url, prepend_base=True):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # pick random user agent and viewport
        user_agent = random.choice(USER_AGENTS)
        viewport_width, viewport_height = random.choice(VIEWPORTS)

        context = browser.new_context(
            user_agent=user_agent,
            viewport={"width": viewport_width, "height": viewport_height}
        )
        page = context.new_page()

        # get base domain for filtering
        parsed_url = urlparse(url)
        page_domain = parsed_url.hostname.replace("www.", "") if parsed_url.hostname else ""

        # alow only safe/resource-light requests
        def should_allow_request(request, page_domain):
            req_url = request.url.lower()
            req_domain = urlparse(req_url).hostname

            if request.resource_type in ("document", "image"):
                return True
            if request.resource_type in ("script", "stylesheet", "fetch", "xhr"):
                if req_domain and page_domain in req_domain:
                    return True
            print_flush(f"[x] Blocking request: {request.url}")
            return False

        # route all requests through filter
        page.route("**/*", lambda route, request: (
            route.continue_() if should_allow_request(request, page_domain) else route.abort()
        ))

        # log session setup
        print_flush(f"[*] Using user agent: {user_agent}")
        print_flush(f"[*] Using viewport: {viewport_width}x{viewport_height}")
        print_flush(f"[*] Navigating to URL: {url}")

        # try to navigate to page
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print_flush(f"[!] Navigation failed: {e}")
            return []

        # wait for at least one link
        try:
            page.wait_for_selector("a", timeout=10000)
        except Exception:
            print_flush("[!] No links found or page did not load in time.")
            return []

        # collect all anchors with "chapter" in href
        anchors = page.query_selector_all("a")
        chapter_links = []
        seen_links = set()

        for a in anchors:
            try:
                href = a.get_attribute("href")
                if href and "chapter" in href.lower():
                    href = href.strip()

                    # normalize relative or protocol-relative URLs
                    if prepend_base:
                        href = urljoin(url, href)

                    # skip duplicates
                    if href not in seen_links:
                        chapter_links.append(href)
                        seen_links.add(href)
                        print_flush(f"Grabbed link: {href}")

            except Exception:
                continue  # skip bad elements

        # report count and close browser
        print_flush(f"[*] Found {len(chapter_links)} chapter links.")
        browser.close()
        return chapter_links

# entry point for script
if __name__ == "__main__":
    target_url = os.getenv("TARGET_URL")
    if not target_url:
        print_flush("[!] TARGET_URL not set in environment.")
        sys.exit(1)

    # parse environment flag for URL prepending
    prepend_base_env = os.getenv("PREPEND_BASE_URL", "true").lower()
    prepend_base = prepend_base_env in ("true", "1", "yes")

    scrape_chapter_links(target_url, prepend_base)
