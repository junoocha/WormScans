import sys
import os
from playwright.sync_api import sync_playwright
import re

def log(message):
    """Print message for SSE streaming"""
    print(message, flush=True)

def scrape_bato_chapters():
    """
    Scrape chapter links from bato.si using environment variables
    Compatible with Next.js API route streaming
    """
    # Get environment variables
    target_url = os.environ.get("TARGET_URL", "")
    prepend_base = os.environ.get("PREPEND_BASE_URL", "true").lower() == "true"
    
    if not target_url:
        log("Error: No TARGET_URL provided")
        return
    
    log(f"Loading bato.si page: {target_url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        try:
            page.goto(target_url, wait_until='networkidle', timeout=30000)
            log("Page loaded, waiting for content...")
            page.wait_for_timeout(2000)
            
            # Scroll to trigger any lazy loading
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1000)
            log("Scrolled page to load content")
            
            chapter_links = []
            all_links = page.locator('a').all()
            
            log(f"Found {len(all_links)} total links on page")
            
            # Extract title ID from the URL for filtering
            title_id_match = re.search(r'/title/(\d+)', target_url)
            title_id = title_id_match.group(1) if title_id_match else None
            
            if not title_id:
                log("Warning: Could not extract title ID from URL")
            
            for link in all_links:
                try:
                    href = link.get_attribute('href')
                    
                    # Filter for chapter links specific to this series
                    # Match both formats: /title/134839/ and /title/134839-series-name/
                    if href and title_id and f'/title/{title_id}' in href and '-ch_' in href:
                        text = link.inner_text().strip()
                        
                        # Skip "Start Reading" button or empty text
                        if text and not text.startswith('Start Reading'):
                            # Make absolute URL if needed
                            if href.startswith('/') and prepend_base:
                                href = 'https://bato.si' + href
                            elif not href.startswith('http') and prepend_base:
                                href = 'https://bato.si/' + href
                            
                            if href not in chapter_links:
                                chapter_links.append(href)
                                log(f"Grabbed link: {href}")
                except Exception as e:
                    continue
            
            # Sort by chapter number (ascending - first chapters on top)
            def get_chapter_num(url):
                match = re.search(r'-ch_(\d+)', url)
                return int(match.group(1)) if match else 0
            
            chapter_links.sort(key=get_chapter_num)
        
            
            log(f"Successfully scraped {len(chapter_links)} chapters")
            browser.close()
            
        except Exception as e:
            log(f"Error during scraping: {str(e)}")
            browser.close()

if __name__ == "__main__":
    scrape_bato_chapters()