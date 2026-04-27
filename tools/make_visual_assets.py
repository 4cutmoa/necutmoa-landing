from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


root = Path("assets")


def load_font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/malgunbd.ttf" if bold else "C:/Windows/Fonts/malgun.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def make_two_screen_gif():
    files = ["app-album-detail.png", "app-subscription.png"]
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
        root / "app-album-calendar.gif",
        save_all=True,
        append_images=frames[1:],
        duration=1400,
        loop=0,
        optimize=True,
        disposal=2,
    )


def draw_road(draw, points, color, width):
    draw.line(points, fill=color, width=width, joint="curve")


def make_map_image():
    width, height = 1100, 900
    image = Image.new("RGBA", (width, height), (246, 250, 255, 255))
    draw = ImageDraw.Draw(image, "RGBA")

    header_h = 220
    draw.rounded_rectangle((30, 30, width - 30, height - 30), radius=12, fill=(255, 255, 255, 255), outline=(205, 216, 230, 255), width=2)
    draw.rectangle((32, 32, width - 32, header_h), fill=(225, 237, 249, 255))

    title_font = load_font(54, bold=False)
    subtitle_font = load_font(30)
    button_font = load_font(28)
    label_font = load_font(31, bold=True)
    count_font = load_font(30)

    draw.text((85, 80), "지도", fill=(19, 23, 32, 255), font=title_font)
    draw.text((88, 150), "7곳의 추억", fill=(116, 122, 145, 255), font=subtitle_font)
    draw.rectangle((820, 88, 1005, 175), fill=(255, 255, 255, 255), outline=(156, 164, 176, 255), width=2)
    draw.text((850, 114), "방문한 곳", fill=(10, 12, 18, 255), font=button_font)

    map_top = header_h
    map_bottom = height - 30

    for x in range(30, width - 30, 98):
        draw.line((x, map_top, x, map_bottom), fill=(209, 220, 234, 180), width=1)
    for y in range(map_top, map_bottom, 98):
        draw.line((30, y, width - 30, y), fill=(209, 220, 234, 180), width=1)

    draw_road(draw, [(35, 310), (330, 520), (620, 700), (1065, 860)], (232, 184, 105, 135), 38)
    draw_road(draw, [(170, 870), (260, 650), (410, 510), (620, 250), (720, 30)], (232, 184, 105, 135), 38)
    draw_road(draw, [(30, 650), (360, 580), (690, 510), (1070, 440)], (104, 164, 214, 120), 86)

    draw.text((115, 340), "종로구", fill=(111, 119, 145, 255), font=label_font)
    draw.text((850, 385), "성수", fill=(111, 119, 145, 255), font=label_font)
    draw.text((715, 600), "강남구", fill=(111, 119, 145, 255), font=label_font)

    def pin(x, y, text, size=170):
        draw.rectangle((x, y, x + size, y + size), fill=(18, 18, 25, 255))
        draw.line((x + 20, y + size - 8, x + size - 8, y + 20), fill=(230, 241, 255, 255), width=10)
        draw.rectangle((x + 18, y + size - 72, x + 92, y + size - 8), fill=(234, 244, 255, 255))
        draw.text((x + 40, y + size - 61), text, fill=(0, 0, 0, 255), font=count_font)
        shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow, "RGBA")
        shadow_draw.rectangle((x + 10, y + 18, x + size + 10, y + size + 18), fill=(0, 0, 0, 28))
        image.alpha_composite(shadow)

    pin(330, 410, "50", 180)
    pin(590, 660, "20", 190)
    pin(745, 520, "10", 170)

    image.save(root / "app-map.png")


if __name__ == "__main__":
    make_two_screen_gif()
    make_map_image()
