# Material de UNOTRES (https://unotres-lista-proyectos.netlify.app/): fachadas, galerías, documentos y proyectos nuevos.
# Uso: python3 build_u3.py <trabajo> <repo>   (necesita <trabajo>/u3/folders.json y <trabajo>/u3w/img)
import json, os, re, sys, unicodedata
from PIL import Image
W, REPO = sys.argv[1], sys.argv[2]
FOLDERS = json.load(open(f"{W}/u3/folders.json"))
q = lambda v: "NULL" if v is None else (str(v) if isinstance(v, (int, float)) else "'" + str(v).replace("'", "''") + "'")
def link(key, fragment):
    for it in FOLDERS[key]:
        if unicodedata.normalize("NFC", fragment) in unicodedata.normalize("NFC", it["path"]): return f"https://drive.google.com/file/d/{it['id']}/view"
    raise SystemExit(f"no encontrado {key}: {fragment}")
P = {
 "narciso": {"id": "narciso", "facade": "Renders_exteriores_EXT2", "brochure": "Brochure TNLC.pdf",
             "docs": [("Tríptico", "TRIPTICO TNLC"), ("Planos generales", "NARCISO LA CUADRITA.pdf"), ("Planos de tipologías", "TIPOLOGIAS.pdf")], "plans": "TIPOLOGIAS.pdf"},
 "solana-2": {"id": "solana-2", "facade": "Renders_VISTA_FACHADA", "brochure": "BROCHURE ACTUALIZADO JUNIO 2026",
              "docs": [("Lista de precios 14/09/2026", "Torre Solana2-Lista de precios.pdf"), ("Disponibles en plano", "Torre Solana 2 disponibles en plano.pdf"),
                       ("Plano 1 dormitorio A", "1 DOR. A.pdf"), ("Plano 2 dormitorios A", "2 DOR. A.pdf")], "price_list": "Torre Solana2-Lista de precios.pdf"},
 "casas-bosque": {"id": "casas-bosque", "facade": "Renders_VISTA_1", "brochure": "Casas del Bosque-Brochure",
                  "docs": [("Lista de precios 02/02/2026", "Lista Casas del Bosque"), ("Tipologías", "Comercial-TIPOLOG"), ("Planta baja", "PB_A3.pdf"), ("Planta alta", "PA_A3.pdf")],
                  "plans": "Comercial-TIPOLOG", "skip": "PALADA"},
 "torre-narciso": {"id": "unotres-torre-narciso", "facade": "Renders_VISTA_FACHADA_1_", "brochure": "Torre Narciso Brochure",
                   "docs": [("Planos arquitectónicos", "TN Planos Arquitectonicos.pdf")], "plans": "TN Planos Arquitectonicos.pdf",
                   "new": dict(name="Torre Narciso", location="Las Lomas, Asunción", stage="Semiterminado", delivery="Diciembre de 2026", confidence="Confirmado",
                               updated="2026-09-21", color="#8a6a50", parking=20000, source="Lista 10/08/2026 · verificada 21/09/2026", map="Torre Narciso Las Lomas Asuncion",
                               summary="Edificio en obra en Las Lomas con entrega en diciembre de 2026. Queda la última unidad: 303, 1 dormitorio B de 49,5 m², pagadera en 6 cuotas de USD 20.600. Cochera opcional USD 20.000 (2 libres). Expensas aprox. USD 1,4–1,6 por m²."),
                   "units": [("303", "3", "1 dormitorio B", 1, 49.5, None, 49.5, 123600, 0, ["Última unidad", "6 cuotas de USD 20.600", "Cochera opcional USD 20.000"])]},
 "tres-kandu": {"id": "unotres-tres-kandu", "facade": "Renders_Torre_1_VISTA_GENERAL_TRES_KANDU", "brochure": "Brochure - Tres Kandú - Marzo 2025.pdf",
                "docs": [("Brochure Torre 2", "BROCHURE TRES KANDÚ TORRE 2.pdf"), ("Planos comerciales generales", "planos comerciales generales.pdf"),
                         ("Planos comerciales particulares", "planos comerciales particulares.pdf")], "plans": "planos comerciales particulares.pdf", "skip": "Avances_de_Obra",
                "new": dict(name="Tres Kandú", location="Villa Universitaria, Fernando de la Mora Zona Norte", stage="Semiterminado", delivery="Agosto de 2026", confidence="Parcial",
                            updated="2026-09-21", color="#6f7d6a", parking=13000, source="Lista 16/09/2026 · verificada 21/09/2026", map="Tres Kandu Villa Universitaria Fernando de la Mora",
                            summary="Edificio en obra frente a la zona de la Universidad Nacional, entrega agosto de 2026. Quedan 5 unidades 1D++ de 46,6 m² (212, 312, 412, 812 y 912) entre USD 62.200 y 67.000; el precio exacto de cada una se confirma con UNOTRES. 24 cocheras desde USD 13.000 y bauleras a USD 5.000."),
                "units": [(c, c[0], "1 dormitorio ++", 1, 46.6, None, 46.6, 62200, 0, ["Precio desde: rango USD 62.200–67.000, confirmar por unidad", "Cochera opcional desde USD 13.000"]) for c in ["212", "312", "412", "812", "912"]]},
 "villa-bosque": {"id": "unotres-villa-bosque", "facade": "Renders_05_03_RAW_01", "brochure": "Brochure-Villa del Bosque.pdf",
                  "docs": [("Planta tipo 1", "Villa del Bosque - Tipo 1.pdf"), ("Planta tipo 2", "Villa del Bosque - Tipo 2.pdf")], "plans": "Villa del Bosque - Tipo 1.pdf",
                  "new": dict(name="Villa del Bosque", location="Aeropuerto, Luque", stage="Terminado", delivery="Terminado — casas alquiladas", confidence="Confirmado",
                              updated="2026-09-21", color="#7b6b55", parking=None, source="Disponibilidad verificada 21/09/2026", map="Villa del Bosque condominio Luque Aeropuerto",
                              summary="Condominio cerrado terminado con piscina de borde infinito, seguridad 24 h, quincho, SUM y gimnasio. Quedan 2 casas a USD 185.000, ambas alquiladas (renta activa USD 1.250/mes): ideal para inversión. Expensas USD 190."),
                  "units": [("Casa 1", "Casa", "Casa 3 dormitorios · tipo A", 3, 160, 0, 160, 185000, 2, ["Alquilada hasta marzo", "Renta USD 1.250/mes", "Expensas USD 190"]),
                            ("Casa 12", "Casa", "Casa 3 dormitorios · tipo B", 3, 180, 0, 180, 185000, 2, ["Alquilada hasta octubre", "Renta USD 1.250/mes", "Expensas USD 190"])]},
}
def nice(stem):
    t = re.sub(r"^(Renders|Fotos)_+", "", stem)
    t = re.sub(r"(Torre_1_)?VISTA_|exteriores_|interiores_|Departamento_Modelo_Fotos_|CASA_MODELO_[\w-]*|RAW_\d+|TNLC-DO-IMG-REN-|_\d+_$", " ", t)
    t = re.sub(r"[_-]+", " ", t)
    t = re.sub(r"\b(EXT|INT|IMG|ISO)\s*\d*\b|\b[0-9a-f]{6,}\b|\b\d+\b", " ", t, flags=re.I)
    t = " ".join(t.split())
    if "CASA_MODELO" in stem or "Departamento_Modelo" in stem: t = "Casa modelo" if "CASA" in stem else "Departamento modelo"
    if "exteriores" in stem: t = "Exterior"
    t = {"raw": "Vista", "render": "Vista", "general tres kandu copy": "Vista general", "general tres kandu": "Vista general", "balcon": "Balcón", "cowork": "Coworking", "diurna": "Vista diurna"}.get(t.lower(), t)
    return (t[:1].upper() + t[1:].lower()) if t else "Vista"
lines = ["-- Material oficial de UNOTRES (portal de proyectos). Generado por scripts/unotres/build_u3.py.",
         "INSERT OR IGNORE INTO developers (id, name) VALUES ('unotres', 'UNOTRES');"]
for key, c in P.items():
    pid, imgdir = c["id"], f"{W}/u3w/img/{key}"
    files = sorted(f for f in os.listdir(imgdir) if not (c.get("skip") and c["skip"] in f))
    files.sort(key=lambda f: (not f.startswith("Renders"), f))
    out = f"{REPO}/public/projects/{pid}"; os.makedirs(f"{out}/galeria", exist_ok=True)
    Image.open(f"{imgdir}/{c['facade']}.jpg").save(f"{out}/fachada.jpg", quality=82)
    gallery = []
    for f in files:
        if f[:-4] == c["facade"] or len(gallery) >= 12: continue
        n = len(gallery) + 1
        im = Image.open(f"{imgdir}/{f}"); im.thumbnail((1280, 1280)); im.save(f"{out}/galeria/{n:02d}.jpg", quality=76, optimize=True)
        gallery.append({"src": f"/projects/{pid}/galeria/{n:02d}.jpg", "title": nice(f[:-4])})
    docs = [{"label": l, "url": link(key, frag)} for l, frag in c["docs"]]
    extra = json.dumps({"gallery": gallery, "documents": docs}, ensure_ascii=False)
    brochure, plans = link(key, c["brochure"]), (link(key, c["plans"]) if c.get("plans") else None)
    if "new" in c:
        n = c["new"]
        lines.append("INSERT OR IGNORE INTO projects (id, developer_id, name, location, stage, delivery, confidence, summary, brochure_url, plans_url, map_query, color, image_url, parking_price_usd, source_label, extra, updated_at) VALUES ("
                     + ", ".join(q(v) for v in [pid, "unotres", n["name"], n["location"], n["stage"], n["delivery"], n["confidence"], n["summary"], brochure, plans,
                                               n["map"], n["color"], f"/projects/{pid}/fachada.jpg", n["parking"], n["source"], extra, n["updated"]]) + ");")
        for code, floor, typ, bd, own, bal, tot, price, park, feats in c["units"]:
            uid = f"{pid}-{code.lower().replace(' ', '')}"
            lines.append("INSERT OR IGNORE INTO units (id, project_id, code, floor, type, bedrooms, own_m2, balcony_m2, total_m2, currency, price, parking, status, features, extra, updated_at) VALUES ("
                         + ", ".join(q(v) for v in [uid, pid, code, floor, typ, bd, own, bal or None, tot, "USD", price, park, "Disponible", json.dumps(feats, ensure_ascii=False), "{}", n["updated"]]) + ");")
    else:
        sets = [f"extra = json_patch(extra, {q(extra)})", f"brochure_url = {q(brochure)}",
                f"image_url = CASE WHEN image_url IS NULL OR image_url LIKE '/projects/%' THEN '/projects/{pid}/fachada.jpg' ELSE image_url END"]
        if plans: sets.append(f"plans_url = {q(plans)}")
        if c.get("price_list"): sets.append(f"price_list_url = {q(link(key, c['price_list']))}")
        lines.append(f"UPDATE projects SET {', '.join(sets)} WHERE id = '{pid}';")
    print(pid, len(gallery), "imgs", len(docs), "docs")
# Torre Solana 2: lista del 14/09/2026 -> 314 y 315 pasaron a reservadas.
for code in ["314", "315"]:
    lines.append(f"INSERT INTO unit_changes (id, unit_id, field, old_value, new_value, source, created_at) SELECT lower(hex(randomblob(16))), id, 'status', status, 'Reservado', 'Lista Torre Solana 2 14/09/2026 (portal UNOTRES)', datetime('now') FROM units WHERE project_id = 'solana-2' AND code = '{code}' AND status = 'Disponible';")
    lines.append(f"UPDATE units SET status = 'Reservado', updated_at = '2026-09-21' WHERE project_id = 'solana-2' AND code = '{code}' AND status = 'Disponible';")
lines.append("UPDATE projects SET updated_at = '2026-09-21', source_label = 'Lista 14/09/2026 · verificada 21/09/2026', summary = 'Torre en pozo en Las Lomas (inicio de obra julio 2026, 24 meses). Según la lista del 14/09/2026 quedan unidades de 1 y 2 dormitorios desde USD 100.263; monoambientes agotados. Cocheras USD 20.000 y bauleras USD 5.000. Amenities: piscina de 27 m, spa, saunas, coworking, gimnasio, salón de eventos, quinchos.' WHERE id = 'solana-2';")
open(f"{REPO}/migrations/0007_unotres_media.sql", "w").write("\n".join(lines) + "\n")
