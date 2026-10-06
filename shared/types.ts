import type { ClientStage, OperationStatus, Role, UnitStatus } from "./roles";

export type User = { id: string; email: string; name: string; role: Role; phone?: string | null; active: number; must_change_password: number };

export type Developer = { id: string; name: string; contact_name?: string | null; contact_phone?: string | null; notes?: string | null };

export type Project = {
  id: string; developer_id: string; developer_name?: string; name: string; location: string; stage: string; delivery: string;
  confidence: string; summary: string; brochure_url?: string | null; price_list_url?: string | null; plans_url?: string | null;
  media_url?: string | null; video_url?: string | null; drive_url?: string | null; map_query?: string | null; color?: string | null;
  image_url?: string | null; parking_price_usd?: number | null; source_label?: string | null; extra: string; active: number; updated_at: string;
  available_units?: number; min_price_usd?: number | null; max_price_usd?: number | null;
};

export type Unit = {
  id: string; project_id: string; code: string; floor: string; type: string; bedrooms: number; own_m2: number | null;
  balcony_m2: number | null; total_m2: number | null; currency: "USD" | "PYG"; price: number; parking: number; status: UnitStatus;
  down_payment: number | null; monthly_payment: number | null; balance_on_delivery: number | null; features: string; extra: string;
  updated_at: string; project_name?: string; developer_name?: string; location?: string; stage?: string; delivery?: string;
};

export type Client = {
  id: string; name: string; phone?: string | null; email?: string | null; source?: string | null; stage: ClientStage;
  purpose?: string | null; budget_min_usd?: number | null; budget_max_usd?: number | null; bedrooms_min?: number | null;
  zones?: string | null; preferences?: string | null; notes?: string | null; assigned_to?: string | null; assigned_name?: string | null;
  last_contact_at?: string | null; next_action_at?: string | null; lost_reason?: string | null; created_at: string; updated_at: string;
};

export type Interaction = { id: string; client_id: string; user_id: string | null; user_name?: string | null; kind: string; note: string; created_at: string };

export type Task = {
  id: string; client_id: string | null; client_name?: string | null; assigned_to: string; assigned_name?: string | null; title: string;
  due_at: string; done_at: string | null; auto: number; created_at: string;
};

export type ProposalOption = { unitId: string; discountPercent?: string; delivery?: string };
export type ProposalSettings = { paymentMode: "financiado" | "contado"; fx: number; downPercent: number; term: number; parkingChoice?: { enabled: boolean; priceUSD: string } };
export type Proposal = {
  id: string; client_id: string | null; client_name: string; user_id: string; user_name?: string; user_phone?: string | null; user_email?: string;
  settings: string; options: string; note?: string | null; created_at: string;
};

export type Operation = {
  id: string; unit_id: string | null; unit_label: string; client_id: string | null; client_name: string; seller_id: string; seller_name?: string;
  status: OperationStatus; price_usd: number; commission_pct?: number; seller_share_pct?: number; reserved_at: string; closed_at: string | null;
  notes?: string | null; created_at: string;
};

export type Payment = {
  id: string; operation_id: string | null; operation_label?: string | null; kind: "cobro" | "pago_vendedor" | "gasto" | "ingreso"; category?: string | null;
  description: string; amount_usd: number; due_date: string | null; paid_date: string | null; user_id: string | null; user_name?: string | null; created_at: string;
};

export type Notification = { id: string; title: string; body?: string | null; link?: string | null; read_at: string | null; created_at: string };
