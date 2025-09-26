# scraper/playwright_utils.py

import time
import random
from playwright.sync_api import Page

# mouse and scroll behavior to mimic human interaction
def simulate_human_behavior(page):
    print("[*] Simulating human-like behavior...")

    # random mouse movement and hover
    elements = page.query_selector_all("a, button, div, span") # common interactive tags
    safe_elements = [el for el in elements if el.is_visible() and el.bounding_box()] # visible ones only, don't get caught
    # bounding box is for returning the position and size btw

    if safe_elements:
        # pick 1-3 random elements
        hover_count = random.randint(1, min(3, len(safe_elements)))
        for _ in range(hover_count):
            el = random.choice(safe_elements)
            box = el.bounding_box()
            if box: # if there's no box, element is either not rendered or invisble/offscreen
                x = box["x"] + box["width"] / 2
                y = box["y"] + box["height"] / 2
                page.mouse.move(x, y) # move mouse to spot
                print(f"[*] Hovered over element at ({x:.0f}, {y:.0f})")
                time.sleep(random.uniform(0.3, 1.0)) # quick pause

    # smarter scrolling
    scroll_times = random.randint(1, 3) # randomly scroll 1-3 times
    for _ in range(scroll_times):
        scroll_px = random.randint(10, 20) # scroll by variable amount
        page.evaluate(f"window.scrollBy(0, {scroll_px})") # actual scroll action
        print(f"[*] Scrolled {scroll_px}px")
        time.sleep(random.uniform(0.5, 1.5)) # quick pause

    # close any popups
    page.on("popup", lambda popup: popup.close())

def slow_scroll_to_bottom_with_images(page: Page, scroll_amount=800, wait_ms=500, max_stable_checks=5):
    print("[*] Slowly scrolling to bottom with live image capture...")

    previous_scroll_y = -1
    previous_height = -1
    stable_count = 0
    step_count = 0
    seen_images = set()

    # zoom out for better scroll/lazy loading
    page.evaluate("document.body.style.zoom = '0.25'")

    while True:
        scroll_y = page.evaluate("() => window.scrollY")
        scroll_height = page.evaluate("() => document.body.scrollHeight")

        # check if scroll position is stable
        if scroll_y == previous_scroll_y and scroll_height == previous_height:
            stable_count += 1
        else:
            stable_count = 0

        if stable_count >= max_stable_checks:
            print("[*] Detected bottom of the page.")
            break

        # scroll using mouse wheel for lazy-load triggers because mousewheel is detected for some reason
        page.mouse.wheel(0, scroll_amount)

        # wait a bit for images to load
        page.wait_for_timeout(wait_ms)

        previous_scroll_y = scroll_y
        previous_height = scroll_height
        step_count += 1

        # collect images after each scroll
        current_images = set(
            page.evaluate("""
                () => Array.from(document.images)
                          .map(img => img.src)
                          .filter(src => src && src.startsWith('http'))
            """)
        )

        # print any new images in real-time
        new_images = current_images - seen_images
        for img in new_images:
            print(f"[*] New image detected: {img}")

        seen_images.update(new_images)

    print(f"[*] Scroll complete after {step_count} steps. Total images collected: {len(seen_images)}")
    return list(seen_images)