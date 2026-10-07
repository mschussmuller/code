# Material de JGL Casatua (Drive comercial): fachadas, galerías, documentos y proyectos nuevos.
# Uso: python3 build_jgl.py <trabajo> <repo>   (necesita <trabajo>/jgl/img y <trabajo>/src2/tree-*.json)
import json, os, re, sys
from PIL import Image
W, REPO = sys.argv[1], sys.argv[2]
TREE = json.load(open(f"{W}/src2/tree-1rvxpchMTXqLpkMfFTEZoYujliTMNsDry.json"))
q = lambda v: "NULL" if v is None else (str(v) if isinstance(v, (int, float)) else "'" + str(v).replace("'", "''") + "'")
def link(fragment):
    for it in TREE:
        if fragment in it["path"]: return f"https://drive.google.com/file/d/{it['id']}/view"
    raise SystemExit(f"no encontrado: {fragment}")
PROJECTS = {
  "blu": {"id": "blu", "facade": "Renders_BLU_Fachada", "brochure": "blu_brochure_260715_web.pdf",
          "docs": [("Moodboard de materialidad", "BLU_moodboard_materialidad.pdf")]},
  "mood": {"id": "mood-office", "facade": "Renders_General_1_", "brochure": "comercial_Mood.NJ.pdf",
           "plans": "MOOD - Piso 9 al 12.pdf",
           "docs": [("Plantas pisos 9 al 12", "MOOD - Piso 9 al 12.pdf"), ("Plantas pisos 14 al 16", "MOOD - Piso 14 al 16.pdf"),
                    ("Plantas pisos 18 al 20", "MOOD - Piso 18 al 20.pdf"), ("Plantas pisos 22 al 24", "MOOD - Piso 22 al 24.pdf"),
                    ("Moodboard de materialidad", "MOOD - mood board.pdf")]},
  "matter": {"id": "jgl-matter", "facade": "Renders_Matter_Frente_01_4_", "brochure": "MATTER  - Brochure Digital - Final 2025.pdf",
             "docs": [("Memoria descriptiva", "Torre Matter - Memoria Descriptiva.pdf")],
             "new": {"name": "Torre Matter", "location": "Las Lomas, Asunción (frente al Shopping del Sol)", "stage": "Requiere confirmación",
                     "delivery": "Requiere confirmación", "confidence": "Requiere confirmación", "updated": "2026-10-07", "color": "#5d6b7a",
                     "map": "Torre Matter Papa Juan XXIII Cirilo Caceres Zorrilla Asuncion",
                     "summary": "Torre de oficinas categoría AAA frente al Shopping del Sol: semipisos de 212 a 262 m² y pisos enteros de 424 a 524 m², con 232 cocheras. Sin lista de precios accesible: consultar disponibilidad y valores con Casatua."}},
  "casa-grande": {"id": "jgl-casa-grande", "facade": "MATERIALES_CASA_GRANDE_Renders_CG_Casa_Grande_Frontal_01", "brochure": "Casa Grande - NJ.pdf",
                  "docs": [("Lista de precios · septiembre 2026", "CASA_GRANDE - LP septiembre 2026.pdf")],
                  "new": {"name": "Casa Grande", "location": "Las Lomas, Asunción", "stage": "Prepozo", "delivery": "Requiere confirmación",
                          "confidence": "Confirmado", "updated": "2026-09-30", "color": "#7a5a48", "parking": 27000, "source": "Lista de precios 30/09/2026",
                          "price_list": "CASA_GRANDE - LP septiembre 2026.pdf",
                          "map": "Cirilo Caceres Zorrilla y Narciso R. Colman Asuncion",
                          "summary": "Edificio boutique de 13 residencias a una cuadra del Shopping del Sol: 3 dormitorios de 370 m² con quincho cerrado, family room y 3 cocheras, más penthouse de 4 dormitorios. Pre-venta Friends & Family. 4 unidades disponibles al 30/09/2026; cochera adicional USD 27.000."}},
  "ledix": {"id": "jgl-ledix", "facade": "MATERIALES_LEDIX_Renders_LX_Ledix_Peatonal_v2", "brochure": "LEDIX-BROCHURE DIGITAL (1).pdf",
            "docs": [("Presentación de prensa", "PDF Press Ledix.pdf"), ("Lista de precios · abril 2026", "Ledix  LP Abril 2026 (1).pdf")],
            "new": {"name": "Ledix", "location": "Las Lomas, Asunción", "stage": "Requiere confirmación", "delivery": "Requiere confirmación",
                    "confidence": "Parcial", "updated": "2026-04-30", "color": "#6f6a5c", "parking": 20000, "source": "Lista de precios abril 2026",
                    "price_list": "Ledix  LP Abril 2026 (1).pdf",
                    "map": "Ledix Las Lomas Asuncion Casatua",
                    "summary": "Edificio en esquina de 10 residencias a 5 minutos del Shopping del Sol: departamentos de 3 dormitorios, dúplex de 3 y 4 dormitorios y Signature Floor. Según la lista de abril 2026 sólo queda disponible el dúplex 7 SF; confirmar vigencia. Cochera adicional USD 20.000, baulera USD 4.500."}},
}
UNITS = {
  "jgl-casa-grande": [
    ("1B", "1", "3 dormitorios con quincho", 3, 324, 41.9, 370.25, 1143750, 3),
    ("4A", "4", "3 dormitorios con quincho", 3, 324, 41.9, 370.25, 1190484, 3),
    ("5B", "5", "3 dormitorios con quincho", 3, 324, 41.9, 370.25, 1136137, 3),
    ("7A", "7", "Penthouse 4 dormitorios", 4, 651, 84, 717, 2500000, 4)],
  "jgl-ledix": [("7 SF", "7 (dúplex)", "Signature Floor · dúplex 4 dormitorios", 4, 399, 82, 453, 1550000, 3)],
}
def nice(stem):
    t = re.sub(r".*?Renders_(LX_|CG_)?", "", stem).replace("_", " ")
    t = re.sub(r"\b(BLU|Matter|Ledix|Casa Grande|MOOD)\b ?", "", t, flags=re.I)
    t = re.sub(r"\b(v\d|\d{1,2} ?$|\d+ \d+ ?$)", "", t).strip(" -")
    words = {"bal": "Balcón", "balcon": "Balcón", "ban o": "Baño", "pil": "Piscina", "pileta": "Piscina", "gim": "Gimnasio", "vest": "Vestidor",
             "dorm": "Dormitorio", "peat": "Peatonal", "dpto a lc": "Living comedor", "dpto a cocina": "Cocina", "salon dep": "Salón de deportes",
             "juegos": "Sala de juegos", "aereo": "Vista aérea", "montaje": "Fotomontaje", "spa": "Spa", "cava": "Cava"}
    t = words.get(t.lower(), t)
    return (t[:1].upper() + t[1:].lower()) if t and t.islower() or t.isupper() else (t or "Render")
lines = ["-- Material oficial de JGL Casatua (Drive comercial). Generado por scripts/casatua/build_jgl.py.",
         "INSERT OR IGNORE INTO developers (id, name) VALUES ('jgl-casatua', 'JGL Casatua');"]
for key, cfg in PROJECTS.items():
    pid, imgdir = cfg["id"], f"{W}/jgl/img/{key}"
    files = sorted(os.listdir(imgdir))
    out = f"{REPO}/public/projects/{pid}"; os.makedirs(f"{out}/galeria", exist_ok=True)
    Image.open(f"{imgdir}/{cfg['facade']}.jpg").save(f"{out}/fachada.jpg", quality=82)
    gallery = []
    for f in files:
        if f[:-4] == cfg["facade"] or len(gallery) >= 12: continue
        n = len(gallery) + 1
        im = Image.open(f"{imgdir}/{f}"); im.thumbnail((1280, 1280)); im.save(f"{out}/galeria/{n:02d}.jpg", quality=76, optimize=True)
        gallery.append({"src": f"/projects/{pid}/galeria/{n:02d}.jpg", "title": nice(f[:-4])})
    docs = [{"label": label, "url": link(frag)} for label, frag in cfg["docs"]]
    extra = json.dumps({"gallery": gallery, "documents": docs}, ensure_ascii=False)
    brochure = link(cfg["brochure"])
    if "new" in cfg:
        n = cfg["new"]
        lines.append("INSERT OR IGNORE INTO projects (id, developer_id, name, location, stage, delivery, confidence, summary, brochure_url, price_list_url, map_query, color, image_url, parking_price_usd, source_label, extra, updated_at) VALUES ("
                     + ", ".join(q(v) for v in [pid, "jgl-casatua", n["name"], n["location"], n["stage"], n["delivery"], n["confidence"], n["summary"], brochure,
                                               link(n["price_list"]) if n.get("price_list") else None, n["map"], n["color"], f"/projects/{pid}/fachada.jpg",
                                               n.get("parking"), n.get("source"), extra, n["updated"]]) + ");")
        for code, floor, typ, bd, own, bal, tot, price, park in UNITS.get(pid, []):
            uid = f"{pid}-{code.lower().replace(' ', '')}"
            lines.append("INSERT OR IGNORE INTO units (id, project_id, code, floor, type, bedrooms, own_m2, balcony_m2, total_m2, currency, price, parking, status, features, extra, updated_at) VALUES ("
                         + ", ".join(q(v) for v in [uid, pid, code, floor, typ, bd, own, bal, tot, "USD", price, park, "Disponible",
                                                   json.dumps([f"{park} cocheras incluidas", "Precio de lista"], ensure_ascii=False), "{}", n["updated"]]) + ");")
    else:
        lines.append(f"UPDATE projects SET extra = json_patch(extra, {q(extra)}), brochure_url = {q(brochure)}"
                     + (f", plans_url = {q(link(cfg['plans']))}" if cfg.get("plans") else "")
                     + f", image_url = CASE WHEN image_url IS NULL OR image_url LIKE '/projects/%' THEN '/projects/{pid}/fachada.jpg' ELSE image_url END WHERE id = '{pid}';")
    print(pid, len(gallery), "imgs", len(docs), "docs")
open(f"{REPO}/migrations/0006_casatua_media.sql", "w").write("\n".join(lines) + "\n")
