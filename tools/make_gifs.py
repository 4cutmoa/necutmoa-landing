from pathlib import Path
from PIL import Image, ImageOps

raw = Path("assets/screens-raw/화면")
out = Path("assets")

TARGET_W = 400
TARGET_H = 868
DURATION = 1400

GROUPS = {
    "app-onboarding.gif": [
        "온보딩-1.png",
        "온보딩-2.png",
        "온보딩-3.png",
    ],
    "app-albums.gif": [
        "ALBUM.png",
        "ALBUM-1.png",
    ],
    "app-album-detail.gif": [
        "ALBUM - DETAIL.png",
        "세로형 - 긴 메모. 많은 친구들.png",
    ],
    "app-photo-detail.gif": [
        "상세 - 이미지.png",
        "상세 - 정보.png",
        "상세 - 사진 하나만 있을시.png",
    ],
    "app-subscription.gif": [
        "HOME - NON PREMIUM PLAN.png",
        "HOME - ZOOMED IN.png",
    ],
    "app-map.gif": [
        "MAP-LIST.png",
        "MAP-ZOOMED OUT.png",
        "MAP-SELECTED.png",
    ],
}


def make_frame(path):
    img = Image.open(path).convert("RGB")
    img = ImageOps.fit(img, (TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    return img.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)


for gif_name, filenames in GROUPS.items():
    frames = [make_frame(raw / name) for name in filenames]
    dest = out / gif_name
    frames[0].save(
        dest,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"created {dest}")
