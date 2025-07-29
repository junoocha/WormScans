from playwright.sync_api import sync_playwright

def scrape_images(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  # headless=False if you want to watch it
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")

        # Wait for the images to load
        page.wait_for_selector('img')

        # Grab all images
        images = page.query_selector_all('img')
        for img in images:
            src = img.get_attribute('src')
            if src and 'asuracomic' in src:  # Optional: filter out ad images etc
                print(src)

        browser.close()

# Example usage:
if __name__ == "__main__":
    target_url = input("Paste chapter URL: ").strip()
    scrape_images(target_url)
