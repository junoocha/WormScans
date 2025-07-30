import time
import random
from playwright.sync_api import sync_playwright

def scrape_images(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/114.0.0.0 Safari/537.36"
        ))
        page = context.new_page()

        print("[*] Visiting page...")
        page.goto(url, wait_until="networkidle")

        # Wait for a specific image class
        print("[*] Waiting for content to load...")
        page.wait_for_selector('img.object-cover')

        # Add a small human-like delay
        delay = random.uniform(2.0, 4.0)
        print(f"[*] Sleeping {delay:.2f} seconds like a human...")
        time.sleep(delay)

        # Extract image sources
        images = page.query_selector_all('img.object-cover')
        image_urls = []

        for img in images:
            src = img.get_attribute('src')
            if src and "/storage/media/" in src:
                image_urls.append(src)

        print(f"\n✅ Found {len(image_urls)} manga image(s):\n")
        for url in image_urls:
            print(url)

        browser.close()

# Example usage:
if __name__ == "__main__":
    target_url = input("Paste chapter URL: ").strip()
    scrape_images(target_url)
