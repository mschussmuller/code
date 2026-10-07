-- Imágenes subidas desde la app (fachadas de proyectos). Se sirven en /api/media/:id.
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  data TEXT NOT NULL,          -- base64
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT
);
