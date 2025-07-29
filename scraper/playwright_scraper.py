from playwright.sync_api import sync_playwright

def scrape_with_js(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  # Change to False to see browser window
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")

        # Print a portion of the HTML to see if images are loaded
        html = page.content()
        print(html[:2000])

        browser.close()

if __name__ == "__main__":
    target_url = input("Enter the chapter URL: ")
    scrape_with_js(target_url)
