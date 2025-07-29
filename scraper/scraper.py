import requests
from bs4 import BeautifulSoup

def scrape_images(url):
    session = requests.Session()

    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/114.0.0.0 Safari/537.36"
    })

    print(f"Downloading: {url}")
    response = session.get(url)
    response.raise_for_status()

    print("\n=== HTML Preview ===")
    print(response.text[:2000])
    print("\n=== END ===\n")

    soup = BeautifulSoup(response.content, "html.parser")

    # This grabs only the images that have the "object-cover" class
    image_tags = soup.find_all("img", class_="object-cover")

    image_urls = []
    for img in image_tags:
        src = img.get("src")
        if src and src.startswith("http"):
            image_urls.append(src)

    return image_urls


if __name__ == "__main__":
    url = input("Enter a URL to scrape images from: ")
    images = scrape_images(url)

    print(f"\nFound {len(images)} image(s):")
    for i, img in enumerate(images, 1):
        print(f"{i}. {img}")
