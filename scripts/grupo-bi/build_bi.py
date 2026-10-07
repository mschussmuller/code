# Copies curated BI images into public/projects/<id>/ and writes migrations/0005_grupo_bi_media.sql
import json, os, re, sys
from PIL import Image
S, REPO = sys.argv[1], sys.argv[2]
KEYS = {"velvet": "bi-velvet-mariscal", "dhome-campos": "bi-dhome-campos", "filum-herrera": "bi-filum-herrera", "filum-recoleta": "bi-filum-recoleta",
        "dhome-cdd": "bi-dhome-cdd", "sc-norte": "bi-san-clemente-norte", "santa-marina": "bi-santa-marina-norte",
        "sc-teresa": "bi-san-clemente-santa-teresa", "sc-fernando": "bi-san-clemente-fernando"}
FACADE = {"dhome-campos": "01._Renders/Dhome_fachada", "dhome-cdd": "01._Renders/Dhome_CD", "filum-herrera": "01._Renders/FACHADA_FILUM_HERRERA",
          "filum-recoleta": "01._Renders/01_FR_-_FACHADA", "velvet": "01._Renders/Fachada", "santa-marina": "01._Fotos/01", "sc-teresa": "01._Fotos/Amenities/02"}
q = lambda v: "NULL" if v is None else "'" + str(v).replace("'", "''") + "'"
def nice(name):
    t = re.sub(r"^\d+\.? *(Renders|Fotos) *", "", name.replace("_", " "))
    t = re.sub(r"^(Amenities|Dpto\.? Modelo|Unidad \d+|\d+ - [^ ]+ \w+) *", lambda m: m.group(0), t)
    t = re.sub(r"^\d{2}[\s.-]+|^\d{2}$", "", t).strip(" -")
    t = re.sub(r"\b(FR|FH|SCN)\s*-\s*", "", t)
    t = t[:1].upper() + t[1:].lower() if t.upper() == t else t
    return t or "Foto"
lines = ["-- Material oficial de Grupo BI (portal comercial): fachadas, galerías y documentos. Generado por scripts/grupo-bi/build_bi.py."]
for key, pid in KEYS.items():
    tree = json.load(open(f"{S}/bi/tree-{key}.json"))
    imgdir = f"{S}/bi/img/{key}"
    files = []
    for root, _, fs in os.walk(imgdir):
        for f in fs: files.append(os.path.relpath(os.path.join(root, f), imgdir))
    files.sort()
    outdir = f"{REPO}/public/projects/{pid}"
    os.makedirs(f"{outdir}/galeria", exist_ok=True)
    if key in FACADE:
        Image.open(f"{imgdir}/{FACADE[key].replace("/", "_")}.jpg").save(f"{outdir}/fachada.jpg", quality=82)
        lines.append(f"UPDATE projects SET image_url = '/projects/{pid}/fachada.jpg' WHERE id = '{pid}' AND (image_url IS NULL OR image_url LIKE '/projects/%');")
    gallery, seen = [], set()
    for rel in files:
        stem = rel[:-4]
        if stem == FACADE.get(key, "").replace("/", "_") or "_V2" in stem or stem.endswith("_mod"): continue
        if "Unidad_602" in stem and len([g for g in gallery if "602" in g["src"]]) >= 3: continue
        if len(gallery) >= 12: break
        n = len(gallery) + 1
        im = Image.open(f"{imgdir}/{rel}"); im.thumbnail((1280, 1280)); im.save(f"{outdir}/galeria/{n:02d}.jpg", quality=76, optimize=True)
        gallery.append({"src": f"/projects/{pid}/galeria/{n:02d}.jpg", "title": nice(os.path.basename(stem))})
    docs, brochure, plans = [], None, None
    for it in tree:
        parts = it["path"].split("/"); name = parts[-1]; folder = parts[1] if len(parts) > 2 else ""
        url = f"https://drive.google.com/file/d/{it['id']}/view"
        if "Brochure" in folder: brochure = url; continue
        if "Planos" in folder:
            plans = plans or url; docs.append({"label": f"Planos · {name.rsplit('.',1)[0]}", "url": url}); continue
        if "Especificaciones" in folder: docs.append({"label": "Especificaciones técnicas", "url": url})
        elif "Avances" in folder: docs.append({"label": f"Avance de obra {parts[2] if len(parts)>3 else ''} · {'video' if name.endswith('.mp4') else 'informe'}".replace("  ", " "), "url": url})
        elif "contratos" in folder.lower(): docs.append({"label": f"Modelo de contrato · {name.rsplit('.',1)[0]}", "url": url, "internal": True})
    extra = json.dumps({"gallery": gallery, "documents": docs}, ensure_ascii=False)
    sets = [f"extra = json_patch(extra, {q(extra)})"]
    if brochure: sets.append(f"brochure_url = {q(brochure)}")
    if plans: sets.append(f"plans_url = {q(plans)}")
    lines.append(f"UPDATE projects SET {', '.join(sets)} WHERE id = '{pid}';")
    print(pid, "gallery", len(gallery), "docs", len(docs), "brochure", bool(brochure), "plans", bool(plans))
open(f"{REPO}/migrations/0005_grupo_bi_media.sql", "w").write("\n".join(lines) + "\n")
