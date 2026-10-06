import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vantage-property-os.maximilianoschussmul.chatgpt.site"),
  title: "Vantage Property OS",
  description: "Sistema interno para buscar, comparar y presentar oportunidades inmobiliarias de Vantage Real Estate.",
  icons: { icon: "/brand/vantage-mark-oficial-2026.png", shortcut: "/brand/vantage-mark-oficial-2026.png" },
  openGraph: {
    title: "Vantage Property OS",
    description: "Portafolio, unidades, financiación y propuestas comerciales en un solo lugar.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vantage Property OS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vantage Property OS",
    description: "Proyectos, unidades y propuestas.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
