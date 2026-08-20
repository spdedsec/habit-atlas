from pathlib import Path
from PIL import Image

source = Path("/home/ubuntu/webdev-static-assets/habit-atlas-real-logo.png")
target = Path("/home/ubuntu/habit-atlas/client/public/habit-atlas-logo.png")

with Image.open(source) as original:
    image = original.convert("RGBA")
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "PNG", optimize=True)
