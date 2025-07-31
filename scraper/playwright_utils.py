# scraper/playwright_utils.py

import time
import random

def simulate_human_behavior(page):
    print("[*] Simulating human-like behavior...")

    # 1. Random mouse movement and hover
    elements = page.query_selector_all("a, button, div, span")
    safe_elements = [el for el in elements if el.is_visible() and el.bounding_box()]

    if safe_elements:
        hover_count = random.randint(1, min(5, len(safe_elements)))
        for _ in range(hover_count):
            el = random.choice(safe_elements)
            box = el.bounding_box()
            if box:
                x = box["x"] + box["width"] / 2
                y = box["y"] + box["height"] / 2
                page.mouse.move(x, y)
                print(f"[*] Hovered over element at ({x:.0f}, {y:.0f})")
                time.sleep(random.uniform(0.3, 1.0))

    # 2. Smarter scrolling
    scroll_times = random.randint(2, 5)
    for _ in range(scroll_times):
        scroll_px = random.randint(300, 700)
        page.evaluate(f"window.scrollBy(0, {scroll_px})")
        print(f"[*] Scrolled {scroll_px}px")
        time.sleep(random.uniform(0.5, 1.5))

    # # 4. Block navigation requests to prevent redirects/popups triggered by clicks
    # def handle_route(route, request):
    #     if request.is_navigation_request():
    #         print(f"[!] Blocking navigation to {request.url}")
    #         route.abort()
    #     else:
    #         route.continue_()
    # page.route("**/*", handle_route)

    # 5. Close popups immediately on open
    page.on("popup", lambda popup: popup.close())

    # # 6. Optional harmless clicks (without navigation)
    # clickable_elements = [
    #     el for el in safe_elements
    #     if el.is_enabled()
    # ]
    # if clickable_elements:
    #     click_count = random.randint(1, min(3, len(clickable_elements)))
    #     for el in random.sample(clickable_elements, click_count):
    #         try:
    #             el.click(timeout=1000)
    #             print("[*] Performed a harmless click.")
    #             time.sleep(random.uniform(0.3, 1.0))
    #         except Exception:
    #             pass
