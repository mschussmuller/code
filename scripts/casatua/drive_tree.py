# Lists a public Drive folder recursively using the embeddedfolderview page.
import sys, re, html, json, subprocess
def fetch(fid):
    out = subprocess.run(["curl", "-sS", "-L", f"https://drive.google.com/embeddedfolderview?id={fid}"], capture_output=True, text=True).stdout
    items = []
    for m in re.finditer(r'<div class="flip-entry" id="entry-([\w-]+)".*?<a href="([^"]+)".*?<div class="flip-entry-title">(.*?)</div>', out, flags=re.S):
        eid, href, title = m.group(1), html.unescape(m.group(2)), html.unescape(m.group(3))
        items.append({"id": eid, "title": title, "folder": "/folders/" in href})
    return items
def walk(fid, path, depth, acc):
    for it in fetch(fid):
        p = f"{path}/{it['title']}"
        if it["folder"]:
            if depth < 4: walk(it["id"], p, depth + 1, acc)
        else:
            acc.append({"id": it["id"], "path": p})
    return acc
name, fid = sys.argv[1], sys.argv[2]
res = walk(fid, name, 0, [])
print(json.dumps(res, ensure_ascii=False))
