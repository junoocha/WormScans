import os
import time
import urllib.request
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

def download_image(url, folder, index):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1] or ".jpg"
        filename = f"img_{index:03}{ext}"
        filepath = os.path.join(folder, filename)

        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            data = response.read()
            out_file.write(data)

        print(f"[+] Saved: {filename}")

        if "imgur.com" in url:
            time.sleep(1)  # Delay only for imgur URLs

    except Exception as e:
        print(f"[!] Failed to download {url}: {e}")

def continuous_scroll_and_download(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"[*] Navigating to {url}")
        page.goto(url, wait_until="domcontentloaded")

        # Zoom out for better scroll
        page.evaluate("document.body.style.zoom = '0.25'")

        scroll_step = 0
        scroll_amount = 800

        previous_scroll_y = -1
        previous_height = -1
        stable_count = 0
        max_stable_checks = 5

        print("[*] Scrolling to bottom...")

        while True:
            scroll_y = page.evaluate("() => window.scrollY")
            scroll_height = page.evaluate("() => document.body.scrollHeight")

            if scroll_y == previous_scroll_y and scroll_height == previous_height:
                stable_count += 1
            else:
                stable_count = 0

            if stable_count >= max_stable_checks:
                print("[*] Detected bottom of the page.")
                break

            page.mouse.wheel(0, scroll_amount)
            page.wait_for_timeout(500)

            previous_scroll_y = scroll_y
            previous_height = scroll_height
            scroll_step += 1

        print("[*] Scroll complete. Gathering images...")

        # Grab all image URLs after scrolling
        img_urls = page.evaluate("""
            () => Array.from(document.images).map(img => img.src).filter(src => src && src.startsWith('http'))
        """)

        print(f"[*] Found {len(img_urls)} image URLs. Downloading...")

        # Make sure folder exists
        folder = "debugimages"
        os.makedirs(folder, exist_ok=True)

        # Download images with delay for imgur
        for i, img_url in enumerate(img_urls):
            download_image(img_url, folder, i)

        print("[*] Done.")
        browser.close()

if __name__ == "__main__":
    target_url = "https://w61.secondliferanker.com/second-life-ranker-manga-chapter-199/"
    continuous_scroll_and_download(target_url)
