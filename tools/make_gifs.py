from pathlib import Path
from PIL import Image

raw = Path("assets/screens-raw/화면")
out = Path("assets")

TARGET_W = 400
HOLD_DURATION = 2000   # 각 프레임 유지 시간 (ms)
FADE_STEPS = 10        # 페이드 중간 프레임 수
FADE_DURATION = 50     # 중간 프레임 간격 (ms) → 총 500ms 페이드

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


def load_rgba(path, target_w, target_h):
    img = Image.open(path).convert("RGBA")
    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    return img


def to_palette(rgba):
    bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    bg.alpha_composite(rgba)
    rgb = bg.convert("RGB")
    img_p = rgb.quantize(colors=255, dither=0)
    alpha = rgba.split()[3]
    mask = alpha.point(lambda a: 255 if a < 128 else 0)
    img_p.paste(255, mask=mask)
    img_p.info["transparency"] = 255
    return img_p


def make_fade_frames(img_a, img_b, steps):
    """img_a → img_b 사이 블렌드 프레임 생성"""
    blends = []
    for i in range(1, steps + 1):
        alpha = i / (steps + 1)
        blended = Image.blend(img_a, img_b, alpha)
        blends.append(to_palette(blended))
    return blends


for gif_name, filenames in GROUPS.items():
    # 높이 계산
    first = Image.open(raw / filenames[0])
    target_h = round(first.height * TARGET_W / first.width)

    # RGBA 원본 로드
    rgba_list = [load_rgba(raw / name, TARGET_W, target_h) for name in filenames]

    # 프레임 + 페이드 조립
    all_frames = []
    all_durations = []

    for i, rgba in enumerate(rgba_list):
        # 현재 프레임 유지
        all_frames.append(to_palette(rgba))
        all_durations.append(HOLD_DURATION)

        # 다음 프레임으로 페이드 (마지막은 첫 프레임으로 순환)
        next_rgba = rgba_list[(i + 1) % len(rgba_list)]
        fade = make_fade_frames(rgba, next_rgba, FADE_STEPS)
        all_frames.extend(fade)
        all_durations.extend([FADE_DURATION] * FADE_STEPS)

    dest = out / gif_name
    all_frames[0].save(
        dest,
        save_all=True,
        append_images=all_frames[1:],
        duration=all_durations,
        loop=0,
        optimize=False,
        disposal=2,
    )
    print(f"created {dest} ({TARGET_W}x{target_h}, {len(all_frames)} frames)")
