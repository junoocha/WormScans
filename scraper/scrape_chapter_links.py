import os
import sys
import random
from urllib.parse import urlparse, urljoin
from playwright.sync_api import sync_playwright

def print_flush(*args, **kwargs):
    print(*args, **kwargs)
    sys.stdout.flush()

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
]

VIEWPORTS = [
    (1366, 768),
    (1920, 1080),
    (1440, 900),
]

def scrape_chapter_links(url, prepend_base=True):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        user_agent = random.choice(USER_AGENTS)
        viewport_width, viewport_height = random.choice(VIEWPORTS)

        context = browser.new_context(
            user_agent=user_agent,
            viewport={"width": viewport_width, "height": viewport_height}
        )
        page = context.new_page()

        # -----------------------
        # BLOCK NON-DOCUMENT / NON-IMAGE REQUESTS
        # -----------------------
        parsed_url = urlparse(url)
        page_domain = parsed_url.hostname.replace("www.", "") if parsed_url.hostname else ""

        def should_allow_request(request, page_domain):
            req_url = request.url.lower()
            req_domain = urlparse(req_url).hostname

            if request.resource_type in ("document", "image"):
                return True
            # allow first-party scripts/styles
            if request.resource_type in ("script", "stylesheet", "fetch", "xhr"):
                if req_domain and page_domain in req_domain:
                    return True
            print_flush(f"[x] Blocking request: {request.url}")
            return False

        page.route("**/*", lambda route, request: (
            route.continue_() if should_allow_request(request, page_domain) else route.abort()
        ))

        print_flush(f"[*] Using user agent: {user_agent}")
        print_flush(f"[*] Using viewport: {viewport_width}x{viewport_height}")
        print_flush(f"[*] Navigating to URL: {url}")

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            print_flush(f"[!] Navigation failed: {e}")
            return []

        # -----------------------
        # Grab chapter links safely
        # -----------------------
        try:
            page.wait_for_selector("a", timeout=10000)
        except Exception:
            print_flush("[!] No links found or page did not load in time.")
            return []

        anchors = page.query_selector_all("a")
        chapter_links = []
        seen_links = set()

        for a in anchors:
            try:
                href = a.get_attribute("href")
                if href and "chapter" in href.lower():
                    href = href.strip()

                    # Normalize URLs
                    if prepend_base:
                        # urljoin will:
                        # - leave absolute URLs unchanged
                        # - prepend base for relative paths
                        # - handle protocol-relative URLs (//example.com)
                        href = urljoin(url, href)

                    # Avoid duplicates
                    if href not in seen_links:
                        chapter_links.append(href)
                        seen_links.add(href)
                        print_flush(f"Grabbed link: {href}")

            except Exception:
                continue  # skip stale elements

        print_flush(f"[*] Found {len(chapter_links)} chapter links.")
        browser.close()
        return chapter_links

if __name__ == "__main__":
    target_url = os.getenv("TARGET_URL")
    if not target_url:
        print_flush("[!] TARGET_URL not set in environment.")
        sys.exit(1)

    # Convert "true"/"false" strings to boolean
    prepend_base_env = os.getenv("PREPEND_BASE_URL", "true").lower()
    prepend_base = prepend_base_env in ("true", "1", "yes")

    scrape_chapter_links(target_url, prepend_base)