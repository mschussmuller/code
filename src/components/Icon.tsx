const PATHS: Record<string, string> = {
  home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
  building: "M4 21V3h16v18M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M9 21v-3h6v3",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3",
  calendar: "M4 5h16v16H4zM4 9h16M8 3v4M16 3v4",
  file: "M6 2h8l4 4v16H6zM14 2v5h5M9 13h6M9 17h6",
  handshake: "M2 12l5-5 4 2 3-2 5 5M7 7l-5 5 6 6 3-1 3 1 6-6M9 14l2 2M12 13l2 2",
  wallet: "M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3zM3 7V5a2 2 0 0 1 2-2h12M16 13h2",
  team: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  plus: "M12 5v14M5 12h14",
  check: "M5 12l4 4L19 6",
  arrow: "M5 12h14M13 6l6 6-6 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  whatsapp: "M4 20l1.3-3.9A8 8 0 1 1 8 19zM9 9c0 3 3 6 6 6l1.5-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2z",
  print: "M7 9V3h10v6M7 17H4V9h16v8h-3M7 14h10v7H7z",
  map: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15",
  alert: "M12 3 2 21h20zM12 9v5M12 18h.01",
  phone: "M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2",
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
};

export function Icon({ name, size = 18, className = "" }: { name: keyof typeof PATHS | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}
