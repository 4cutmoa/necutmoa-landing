from pathlib import Path

from PIL import Image


root = Path("assets")
files = [
    "app-albums.png",
    "app-photo-detail.png",
    "app-album-detail.png",
    "app-subscription.png",
]

target_w = 400
target_h = 949
background = (247, 250, 255, 255)
frames = []

for name in files:
    image = Image.open(root / name).convert("RGBA")
    scale = min(target_w / image.width, target_h / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    image = image.resize(size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (target_w, target_h), background)
    canvas.alpha_composite(image, ((target_w - size[0]) // 2, (target_h - size[1]) // 2))
    frames.append(canvas.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))

frames[0].save(
    root / "app-rotation.gif",
    save_all=True,
    append_images=frames[1:],
    duration=1400,
    loop=0,
    optimize=True,
    disposal=2,
)
