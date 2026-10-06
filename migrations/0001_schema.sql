-- Vantage OS · esquema inicial
-- Roles: director, socio, admin (administración), vendedor.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('director','socio','admin','vendedor')),
  phone TEXT,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,            -- SHA-256 del token (el token sólo vive en la cookie)
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE developers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL REFERENCES developers(id),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  stage TEXT NOT NULL,
  delivery TEXT NOT NULL,
  confidence TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  brochure_url TEXT,
  price_list_url TEXT,
  plans_url TEXT,
  media_url TEXT,
  video_url TEXT,
  drive_url TEXT,
  map_query TEXT,
  color TEXT,
  image_url TEXT,
  parking_price_usd REAL,
  source_label TEXT,
  extra TEXT NOT NULL DEFAULT '{}', -- auditoría, ficha técnica, políticas (JSON)
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
CREATE INDEX projects_developer ON projects(developer_id);

CREATE TABLE units (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  code TEXT NOT NULL,
  floor TEXT NOT NULL,
  type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  own_m2 REAL,
  balcony_m2 REAL,
  total_m2 REAL,
  currency TEXT NOT NULL CHECK (currency IN ('USD','PYG')),
  price REAL NOT NULL,
  parking INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Disponible','Reservado','Vendido','Requiere confirmación')),
  down_payment REAL,
  monthly_payment REAL,
  balance_on_delivery REAL,
  features TEXT NOT NULL DEFAULT '[]',
  extra TEXT NOT NULL DEFAULT '{}', -- superficies detalladas, plano, imagen (JSON)
  updated_at TEXT NOT NULL
);
CREATE INDEX units_project ON units(project_id);
CREATE INDEX units_status ON units(status);

-- Historial de cambios de precio/estado: alimenta las alertas.
CREATE TABLE unit_changes (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL REFERENCES units(id),
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  source TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT
);
CREATE INDEX unit_changes_created ON unit_changes(created_at);

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT,
  stage TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (stage IN ('nuevo','contactado','visita','propuesta','negociacion','reservado','ganado','perdido')),
  purpose TEXT,                 -- vivienda / inversión / oficina
  budget_min_usd REAL,
  budget_max_usd REAL,
  bedrooms_min INTEGER,
  zones TEXT,                   -- texto libre separado por comas
  preferences TEXT,
  notes TEXT,
  assigned_to TEXT REFERENCES users(id),
  last_contact_at TEXT,
  next_action_at TEXT,
  lost_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT
);
CREATE INDEX clients_assigned ON clients(assigned_to);
CREATE INDEX clients_stage ON clients(stage);

CREATE TABLE interactions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  user_id TEXT REFERENCES users(id),
  kind TEXT NOT NULL,           -- llamada, whatsapp, reunion, visita, email, nota, propuesta, sistema
  note TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX interactions_client ON interactions(client_id, created_at);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id),
  assigned_to TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  due_at TEXT NOT NULL,
  done_at TEXT,
  auto INTEGER NOT NULL DEFAULT 0,  -- creada por una automatización
  created_by TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX tasks_assigned ON tasks(assigned_to, done_at, due_at);

CREATE TABLE proposals (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  settings TEXT NOT NULL,       -- modo de pago, TC, % entrega, cuotas (JSON)
  options TEXT NOT NULL,        -- unidades y ajustes por opción (JSON)
  note TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX proposals_user ON proposals(user_id, created_at);

CREATE TABLE operations (
  id TEXT PRIMARY KEY,
  unit_id TEXT REFERENCES units(id),
  unit_label TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  seller_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('reserva','boleto','escritura','caida')),
  price_usd REAL NOT NULL,
  commission_pct REAL NOT NULL DEFAULT 0,  -- comisión que cobra la inmobiliaria
  seller_share_pct REAL NOT NULL DEFAULT 0, -- parte de esa comisión para el vendedor
  reserved_at TEXT NOT NULL,
  closed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT
);
CREATE INDEX operations_seller ON operations(seller_id);

-- Movimientos financieros: cobros de comisión, pagos a vendedores, gastos, otros ingresos.
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  operation_id TEXT REFERENCES operations(id),
  kind TEXT NOT NULL CHECK (kind IN ('cobro','pago_vendedor','gasto','ingreso')),
  category TEXT,
  description TEXT NOT NULL,
  amount_usd REAL NOT NULL,
  due_date TEXT,
  paid_date TEXT,
  user_id TEXT REFERENCES users(id),  -- vendedor (pago_vendedor)
  created_at TEXT NOT NULL,
  created_by TEXT
);
CREATE INDEX payments_kind ON payments(kind, paid_date);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX notifications_user ON notifications(user_id, read_at);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX audit_log_created ON audit_log(created_at);
