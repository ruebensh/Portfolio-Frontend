import os
import glob
from PIL import Image

def optimize_hero_frames():
  frame_files = sorted(glob.glob("public/frames/frame_*.jpg"))
  total = len(frame_files)
  print(f"Optimizing {total} hero frames to 1920x1080...")

  for idx, path in enumerate(frame_files):
    try:
      with Image.open(path) as img:
        if img.size[0] > 1920 or img.size[1] > 1080:
          resized = img.resize((1920, 1080), Image.Resampling.LANCZOS)
          resized.save(path, "JPEG", quality=75, optimize=True)
        else:
          img.save(path, "JPEG", quality=75, optimize=True)
    except Exception as e:
      print(f"Error processing {path}: {e}")

    if (idx + 1) % 50 == 0 or idx + 1 == total:
      print(f"Processed {idx + 1}/{total} frames.")

if __name__ == "__main__":
  optimize_hero_frames()
