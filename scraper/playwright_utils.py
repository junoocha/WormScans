# scraper/playwright_utils.py

import time
import random

# mouse and scroll behavior to mimic human interaction
def simulate_human_behavior(page):
    print("[*] Simulating human-like behavior...")

    # 1. random mouse movement and hover
    elements = page.query_selector_all("a, button, div, span") # common interactive tags
    safe_elements = [el for el in elements if el.is_visible() and el.bounding_box()] # visible ones only, don't get caught
    # bounding box is for returning the position and size btw

    if safe_elements:
        # pick 1-5 random elements
        hover_count = random.randint(1, min(5, len(safe_elements)))
        for _ in range(hover_count):
            el = random.choice(safe_elements)
            box = el.bounding_box()
            if box: # if there's no box, element is either not rendered or invisble/offscreen
                x = box["x"] + box["width"] / 2
                y = box["y"] + box["height"] / 2
                page.mouse.move(x, y) # move mouse to spot
                print(f"[*] Hovered over element at ({x:.0f}, {y:.0f})")
                time.sleep(random.uniform(0.3, 1.0)) # quick pause

    # 2. smarter scrolling
    scroll_times = random.randint(2, 5) # randomly scroll 2-5 times
    for _ in range(scroll_times):
        scroll_px = random.randint(10, 20) # scroll by variable amount
        page.evaluate(f"window.scrollBy(0, {scroll_px})") # actual scroll action
        print(f"[*] Scrolled {scroll_px}px")
        time.sleep(random.uniform(0.5, 1.5)) # quick pause

    # 3. close any popups
    page.on("popup", lambda popup: popup.close())

def slow_scroll_to_bottom_with_images(page, max_attempts=10, scroll_step=300, wait_range=(1.5, 3), bottom_tolerance=50):
    print("[*] Slowly scrolling to bottom with live image capture...")

    collected_images = set()
    last_scroll_y = -1
    stable_scroll_count = 0

    for i in range(max_attempts):
        scroll_info = page.evaluate("""({step, tolerance}) => {
            window.scrollBy(0, step);
            const scrollY = window.scrollY;
            const innerHeight = window.innerHeight;
            const scrollHeight = document.documentElement.scrollHeight;
            const atBottom = (scrollY + innerHeight) >= (scrollHeight - tolerance);
            return { scrollY, innerHeight, scrollHeight, atBottom };
        }""", {"step": scroll_step, "tolerance": bottom_tolerance})

        print(f"[*] Step {i+1}: scrollY={scroll_info['scrollY']}, atBottom={scroll_info['atBottom']}")

        # If scroll position is stable (not increasing), count it
        if scroll_info['scrollY'] == last_scroll_y:
            stable_scroll_count += 1
        else:
            stable_scroll_count = 0

        last_scroll_y = scroll_info['scrollY']

        # Grab images after scroll
        images = page.query_selector_all("img")
        for img in images:
            src = (
                img.get_attribute("src") or
                img.get_attribute("data-src") or
                img.get_attribute("data-lazy-src") or
                img.get_attribute("data-original")
            )
            if src and src.strip().lower().startswith("http"):
                collected_images.add(src.strip())

        time.sleep(random.uniform(*wait_range))

        # Stop if either bottom reached or scroll position stable for 3 steps (means can't scroll more)
        if scroll_info['atBottom'] or stable_scroll_count >= 3:
            print("[*] Reached bottom or scroll position stable for 3 steps.")
            
            # Try a little wiggle to trigger lazy loading
            page.evaluate("window.scrollBy(0, -200)")
            time.sleep(random.uniform(1, 2))
            page.evaluate("window.scrollBy(0, 200)")
            time.sleep(random.uniform(1, 2))

            break

    print(f"[*] Finished scrolling. Collected {len(collected_images)} images.")
    return list(collected_images)

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