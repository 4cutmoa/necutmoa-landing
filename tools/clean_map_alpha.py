from pathlib import Path

from PIL import Image


path = Path("assets/app-map.png")
image = Image.open(path).convert("RGBA")
pixels = image.load()
width, height = image.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a < 252:
            pixels[x, y] = (r, g, b, 0)

alpha = image.getchannel("A")
bbox = alpha.getbbox()
if bbox:
    image = image.crop(bbox)

image.save(path)
