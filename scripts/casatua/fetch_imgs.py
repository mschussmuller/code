# Downloads image files listed in tree-*.json (public Drive) and saves resized JPEGs.
import json, glob, os, subprocess, sys, re
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
src, out = sys.argv[1], sys.argv[2]
for f in sorted(glob.glob(os.path.join(src, "tree-*.json"))):
    key = os.path.basename(f)[5:-5]
    for it in json.load(open(f)):
        name = it["path"].split("/")[-1]
        if not re.search(r"\.(png|jpe?g)$", name, re.I) or "magnific" in name: continue
        rel = it["path"].split("/", 1)[1]
        dest = os.path.join(out, key, re.sub(r"[^\w.-]+", "_", rel.rsplit(".", 1)[0]) + ".jpg")
        if os.path.exists(dest): continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        tmp = dest + ".raw"
        subprocess.run(["curl", "-sS", "-L", "-o", tmp, f"https://drive.usercontent.google.com/download?id={it['id']}&export=download&confirm=t"], check=False)
        try:
            im = Image.open(tmp); im = im.convert("RGB"); im.thumbnail((1600, 1600)); im.save(dest, "JPEG", quality=80, optimize=True)
            print("ok", key, rel, im.size, os.path.getsize(dest) // 1024, "KB", flush=True)
        except Exception as e:
            print("FAIL", key, rel, e, flush=True)
        finally:
            if os.path.exists(tmp): os.remove(tmp)
