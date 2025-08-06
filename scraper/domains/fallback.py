# scraper/sites/fallback.py

import re
import time
from scraper.playwright_utils import simulate_human_behavior
from scraper.playwright_scraper import print_flush
from urllib.parse import urlparse

def scrape(page, url):
    print_flush("[*] Using fallback scraper (generic)")

    # extensions we allow (only images)
    ALLOWED_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp", ".gif")

    # get domain, helps with determining api requests that we probably want
    parsed_url = urlparse(url)
    page_domain = parsed_url.hostname.replace("www.", "") if parsed_url.hostname else ""

    # method of determinig if we want to block a domain request
    def should_allow_request(request, page_domain):
        url = request.url.lower()
        parsed_url = urlparse(url)
        request_domain = parsed_url.hostname

        # allow main document and image resources
        if request.resource_type in ("document", "image"):
            return True

        # allow images based on file extension
        if any(url.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            return True

        # allow site's own scripts and styles (first-party only) (like the domain we got from parsing you know)
        if request.resource_type in ("script", "stylesheet", "fetch", "xhr"):
            if request_domain and page_domain in request_domain:
                return True

        # otherwise block block block block
        print_flush(f"[x] Blocking request: {request.url}")
        return False

    # intercept all network requests and determine if we want them or nah
    page.route("**/*", lambda route, request: (
        route.continue_() if should_allow_request(request, page_domain) else route.abort()
    ))

    # try loading the page
    try:
        print_flush(f"[*] Navigating to URL: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=15000)

    except Exception as e:

        print_flush(f"[!] First load failed, retrying once... ({e})")
        time.sleep(1)

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=15000)

        except Exception as e2:
            print_flush(f"[!] Retry failed: {e2}")
            return []

    # human time
    simulate_human_behavior(page)

    # wait for one image to load or be found on DOM
    print_flush("[*] Looking for images...")
    try:
        page.wait_for_selector("img", state="attached", timeout=5000)
    except:
        print_flush("[!] No <img> tags found.")
        return []

    # get all <img> tagged elements
    images = page.query_selector_all("img")
    print_flush(f"[*] Found {len(images)} <img> tags. Checking sources...")

    # try to match chapter number in URL for filtering. Usually helps if they're organized like asura or something
    match = re.search(r'chapter[-_]?(\d+)', url, re.IGNORECASE)
    chapter_str = match.group(1) if match else None

    # yep store em here.
    image_urls = []
    
    # loop through all the images we got, not what we want to display yet
    for img in images:
        src = ( # yeah grab all the valid ones with proper tags
            img.get_attribute("src") or
            img.get_attribute("data-src") or
            img.get_attribute("data-lazy-src") or
            img.get_attribute("data-original")
        )
        print_flush(f"    -> Found image src: {src!r}")
        
        if not src: continue 
        
        # trim the whitespace in front, god it actually prevents some image urls from working properly
        src = src.strip() 
        print_flush(f"    Cleaned image src: {src}")
        
        if not src.startswith("http"): continue

        # filter only by file extension
        if not any(src.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
            continue

        # CAN POTENTIALLY REMOVE THIS, JUST TESTING AND KINDA USELESS FOR NOW BUT COULD BE USEFUL
        # prefer images that include the chapter number, this might actually shoot me in the butt but we'll keep it.
        if chapter_str:
            if chapter_str in src or re.search(rf"(chapter[-_]?0*{chapter_str})", src, re.IGNORECASE):
                image_urls.append(src)
            else:
                # If not matched, still include for now. kinda testing it.
                image_urls.append(src)
        else:
            image_urls.append(src)

    print_flush(f"[*] Found {len(image_urls)} valid images.")
    return image_urls
