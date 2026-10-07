import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const out = process.argv[2];
const names = ["Torre Narciso La Cuadrita", "Torre Narciso", "Torre Solana 1 Las Lomas", "Torre Solana 2 del Sol", "Tres Kandú", "Casas del Bosque", "Villa del Bosque"];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const res = [];
for (const n of names) {
  await p.goto("https://unotres-lista-proyectos.netlify.app/", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.getByText(n, { exact: true }).first().click(); await p.waitForTimeout(1500);
  const d = await p.evaluate(() => ({ url: location.href, text: document.body.innerText, links: [...document.querySelectorAll("a")].map(a => [a.innerText.trim(), a.href]) }));
  res.push({ name: n, ...d });
}
writeFileSync(out, JSON.stringify(res, null, 1)); await b.close();
