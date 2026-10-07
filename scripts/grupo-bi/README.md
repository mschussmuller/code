# Material de Grupo BI

Fuente: portal comercial https://sites.google.com/view/portalgrupobi/inicio (carpetas públicas de Drive por proyecto).

1. `python3 drive_tree.py <clave> <folderId> > <trabajo>/bi/tree-<clave>.json` para cada carpeta "Ver Drive" del portal.
2. `python3 fetch_imgs.py <trabajo>/bi <trabajo>/bi/img` descarga y achica las imágenes.
3. `python3 build_bi.py <trabajo> <repo>` elige fachada y galería, copia a `public/projects/` y genera la migración.

Para una actualización, generar una migración nueva (no editar las ya aplicadas).
