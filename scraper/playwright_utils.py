# scraper/playwright_utils.py

import time
import random

def simulate_human_behavior(page):
    print("[*] Simulating human-like behavior...")

    # Random scrolling
    scroll_times = random.randint(2, 4)
    for _ in range(scroll_times):
        scroll_by = random.randint(300, 700)
        page.evaluate(f"window.scrollBy(0, {scroll_by});")
        delay = random.uniform(0.6, 1.5)
        print(f"[*] Scrolled {scroll_by}px. Sleeping {delay:.2f}s")
        time.sleep(delay)

    # Harmless random clicks
    elements = page.query_selector_all("div, span, section")
    safe_elements = [
        el for el in elements
        if not el.get_attribute("href")
        and not el.get_attribute("onclick")
        and not any(k in (el.get_attribute("class") or "") for k in ["ad", "ads", "sponsor"])
        and not any(k in (el.get_attribute("id") or "") for k in ["ad", "ads", "sponsor"])
    ]

    random.shuffle(safe_elements)
    clicks = random.randint(1, min(3, len(safe_elements)))

    for el in safe_elements[:clicks]:
        try:
            el.scroll_into_view_if_needed()
            el.click(timeout=1000)
            print("[*] Random harmless element clicked.")
            time.sleep(random.uniform(0.4, 1.2))
        except Exception:
            continue

    time.sleep(random.uniform(1.5, 2.5))
