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

    page.on("popup", lambda popup: popup.close())

    # # 4. Slow scroll to bottom with detailed debug info
    # print("[*] Slowly scrolling to bottom...")
    
    # scroll_step = 1000
    # max_scroll_attempts = 20

    # for i in range(max_scroll_attempts):
    #     page.mouse.wheel(0, scroll_step)  # scroll down by scroll_step pixels using mouse wheel
    #     print(f"[*] Mouse wheel scroll down {scroll_step}px (step {i+1})")
    #     time.sleep(random.uniform(1, 2))

    #     scroll_info = page.evaluate("""
    #         () => {
    #             return {
    #                 innerHeight: window.innerHeight,
    #                 scrollY: window.scrollY,
    #                 bodyScrollHeight: document.body.scrollHeight,
    #                 docScrollHeight: document.documentElement.scrollHeight,
    #                 atBottom: (window.innerHeight + window.scrollY) >= Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - 2
    #             };
    #         }
    #     """)
        
    #     print(f"[*] Step {i+1}: innerHeight={scroll_info['innerHeight']} scrollY={scroll_info['scrollY']} "
    #         f"bodyScrollHeight={scroll_info['bodyScrollHeight']} docScrollHeight={scroll_info['docScrollHeight']} atBottom={scroll_info['atBottom']}")
        
    #     if scroll_info['atBottom']:
    #         print("[*] Reached bottom of page.")
    #         break
        
    #     time.sleep(random.uniform(1, 2))

    # time.sleep(random.uniform(1.5, 2.5))
    # page.screenshot(path="manhuaus_debug.png", full_page=True)

    # # # 5. Block navigation requests to prevent redirects/popups triggered by clicks (DONE ELSEWHERE NOW)

    # # 6. Optional harmless clicks (TERRIBLE IN THIS AD_INFESTED ENVIRONMENT)