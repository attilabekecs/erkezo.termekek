"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

const CATEGORIES = [
  "iPhone 6", "iPhone 6s", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus",
  "iPhone SE 2016", "iPhone SE (2020)", "iPhone SE (2022)", "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone 12 Mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16e",
  "iPad 4", "iPad 5", "iPad 6", "iPad 7", "iPad 8", "iPad 9", "iPad 10", "iPad Air", "iPad Air 2", "iPad Air 3", "iPad Air 4", "iPad Air 5",
  "iPad Mini 3", "iPad Mini 4", "iPad Mini 5", "iPad Mini 6", "iPad Pro 2015", "Apple iPad Pro 9.7 2016", "iPad Pro 2017", "iPad Pro 10.5", "iPad Pro 2018", "iPad Pro 2020", "iPad Pro 2021", "iPad Pro 2022",
  "Watch Series 3 38mm", "Watch Series 3 42mm", "Watch Series 4 40mm", "Watch Series 4 44mm", "Watch Series 5 40mm", "Watch Series 5 44mm",
  "Apple Watch Series SE 40mm", "Apple Watch Series SE 44mm", "Apple Watch Series SE2 40mm", "Apple Watch Series SE2 44mm",
  "Watch Series 6 40mm", "Watch Series 6 44mm", "Watch Series 7 41mm", "Watch Series 7 45mm", "Watch Series 8 41mm", "Watch Series 8 45mm", "Watch Series 9 41mm", "Watch Series 9 45mm",
  "Watch Series 10 42 mm", "Watch Series 10 46mm", "Watch Ultra", "Watch Ultra 2", "Watch Ultra 3", "Macbook Air", "Macbook Pro",
  "Airpods", "Airpods 2", "Airpods 3", "Airpods 4", "Airpods Pro", "Airpods Pro 2", "Airpods Pro 3", "Airpods Max",
  "Samsung Galaxy A", "Samsung Galaxy S", "Samsung Galaxy J", "Samsung Galaxy Note", "Samsung Galaxy XCover", "Samsung Galaxy Z", "Huawei", "Xiaomi",
  "Samsung Galaxy Watch Active", "Samsung Galaxy Watch3", "Samsung Galaxy Watch4", "Samsung Galaxy Watch5", "Samsung Galaxy Watch6", "Samsung Galaxy Watch7", "Samsung Galaxy Watch Ultra",
  "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max"
] as const;

type Result = { category: string; quantity: number };
type Unknown = { row: number; name: string; quantity: number; reason: string };

const clean = (value: string) => value.toLowerCase().replace(/[‐‑–—]/g, "-").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
const samsungCategory = (category: string) => category.startsWith("Galaxy ") ? `Samsung ${category}` : category;

function classify(raw: string): string | null {
  const s = clean(raw);
  const has = (pattern: RegExp) => pattern.test(s);

  if (has(/iphone\s*se\s*(?:3|2022|3rd)/)) return "iPhone SE (2022)";
  if (has(/iphone\s*se\s*(?:2|2020|2nd)/)) return "iPhone SE (2020)";
  if (has(/iphone\s*se/) && !has(/2020|2022|2nd|3rd/)) return "iPhone SE 2016";
  for (const model of [17, 16, 15, 14, 13, 12, 11]) {
    if (!has(new RegExp(`iphone\\s*${model}(?!\\d)`))) continue;
    if (model === 16 && has(/iphone\s*16\s*e\b|iphone\s*16e\b/)) return "iPhone 16e";
    if (has(/pro\s*max/)) return `iPhone ${model} Pro Max`;
    if (has(/\bpro\b/)) return `iPhone ${model} Pro`;
    if (has(/\bplus\b/)) return `iPhone ${model} Plus`;
    if (has(/\bmini\b/)) return `iPhone ${model} Mini`;
    return `iPhone ${model}`;
  }
  for (const model of [8, 7, 6]) {
    if (has(new RegExp(`iphone\\s*${model}(?!\\d)`))) return has(/\bplus\b/) ? `iPhone ${model} Plus` : `iPhone ${model}`;
  }
  if (has(/iphone\s*xs\s*max/)) return "iPhone XS Max";
  if (has(/iphone\s*xs\b/)) return "iPhone XS";
  if (has(/iphone\s*xr\b/)) return "iPhone XR";
  if (has(/iphone\s*x\b/)) return "iPhone X";
  if (has(/iphone\s*6s\b/)) return "iPhone 6s";

  if (has(/ipad\s*pro/)) {
    if (has(/9[.,]7|2016/)) return "Apple iPad Pro 9.7 2016";
    if (has(/10[.,]5/)) return "iPad Pro 10.5";
    for (const y of [2022, 2021, 2020, 2018, 2017, 2015]) if (has(new RegExp(`\\b${y}\\b`))) return `iPad Pro ${y}`;
    const gen = s.match(/(?:ipad\s*pro.*?)([1-6])(?:st|nd|rd|th)?\s*(?:gen|generation)/)?.[1];
    const map: Record<string, string> = { "1": "iPad Pro 2015", "2": "iPad Pro 2017", "3": "iPad Pro 2018", "4": "iPad Pro 2020", "5": "iPad Pro 2021", "6": "iPad Pro 2022" };
    return gen ? map[gen] : null;
  }
  if (has(/ipad\s*air/)) {
    const m = s.match(/ipad\s*air\s*(?:\(|-|\s)*(\d)/)?.[1];
    return m && +m >= 2 && +m <= 5 ? `iPad Air ${m}` : "iPad Air";
  }
  if (has(/ipad\s*mini/)) {
    const m = s.match(/ipad\s*mini\s*(?:\(|-|\s)*(\d)/)?.[1];
    return m && +m >= 3 && +m <= 6 ? `iPad Mini ${m}` : null;
  }
  if (has(/\bipad\b/)) {
    const gen = s.match(/(?:ipad[^\d]*)?(4|5|6|7|8|9|10)(?:st|nd|rd|th)?\s*(?:gen|generation)?\b/)?.[1];
    return gen ? `iPad ${gen}` : null;
  }

  if (has(/galaxy\s*watch\s*ultra/)) return "Samsung Galaxy Watch Ultra";
  if (has(/galaxy\s*watch\s*active/)) return "Samsung Galaxy Watch Active";
  const galaxyWatch = s.match(/(?:samsung\s*)?galaxy\s*watch\s*(3|4|5|6|7)\b/)?.[1];
  if (galaxyWatch) return `Samsung Galaxy Watch${galaxyWatch}`;

  if (has(/(?:apple\s*)?watch/)) {
    if (has(/ultra\s*3/)) return "Watch Ultra 3";
    if (has(/ultra\s*2/)) return "Watch Ultra 2";
    if (has(/ultra/)) return "Watch Ultra";
    const size = s.match(/\b(38|40|41|42|44|45|46)\s*mm\b/)?.[1];
    if (has(/\bse\s*2\b|\bse2\b|se\s*2nd/) && size) return `Apple Watch Series SE2 ${size}mm`;
    if (has(/\bse\b/) && size) return `Apple Watch Series SE ${size}mm`;
    const series = s.match(/(?:series|watch)\s*(10|9|8|7|6|5|4|3)\b/)?.[1];
    if (series && size) return series === "10" && size === "42" ? "Watch Series 10 42 mm" : `Watch Series ${series} ${size}mm`;
  }
  if (has(/macbook\s*air/)) return "Macbook Air";
  if (has(/macbook\s*pro/)) return "Macbook Pro";
  if (has(/airpods/)) {
    if (has(/max/)) return "Airpods Max";
    if (has(/pro\s*3|pro\s*3rd/)) return "Airpods Pro 3";
    if (has(/pro\s*2|pro\s*2nd/)) return "Airpods Pro 2";
    if (has(/pro/)) return "Airpods Pro";
    for (const n of [4, 3, 2]) if (has(new RegExp(`airpods\\s*${n}|airpods.*${n}(?:nd|rd|th)\\s*gen`))) return `Airpods ${n}`;
    return "Airpods";
  }
  if (has(/galaxy\s*xcover/)) return "Samsung Galaxy XCover";
  if (has(/galaxy\s*note/)) return "Samsung Galaxy Note";
  if (has(/galaxy\s*z\b/)) return "Samsung Galaxy Z";
  if (has(/galaxy\s*a\s*\d|samsung\s*a\s*\d|\bsm-a\d/)) return "Samsung Galaxy A";
  if (has(/galaxy\s*s\s*\d|samsung\s*s\s*\d|\bsm-s\d/)) return "Samsung Galaxy S";
  if (has(/galaxy\s*j\s*\d|samsung\s*j\s*\d|\bsm-j\d/)) return "Samsung Galaxy J";
  if (has(/huawei|honor/)) return "Huawei";
  if (has(/xiaomi|redmi|poco/)) return "Xiaomi";
  return null;
}

function parseLine(line: string): { name: string; quantity: number } | null {
  const value = line.trim();
  if (!value) return null;
  const cells = value.split(/\t|;|\|/).map(v => v.trim()).filter(Boolean);
  let name = value;
  let quantity = 1;
  if (cells.length > 1 && /^\d+(?:[.,]\d+)?\s*(?:db)?$/i.test(cells.at(-1)!)) {
    quantity = Number(cells.at(-1)!.replace(/db/i, "").replace(",", "."));
    name = cells.slice(0, -1).join(" ");
  } else {
    const match = value.match(/^(.*?)(?:\s+[-–—x×:]?\s*)(\d+(?:[.,]\d+)?)\s*(?:db)?\s*$/i);
    if (match && /[-–—x×:]|\sdb$/i.test(value)) {
      name = match[1].trim();
      quantity = Number(match[2].replace(",", "."));
    }
  }
  if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;
  return { name, quantity };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [processed, setProcessed] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "unknown">("summary");
  const [customMappings, setCustomMappings] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("novaphone-product-mappings");
      if (saved) {
        const mappings = Object.fromEntries(Object.entries(JSON.parse(saved) as Record<string, string>).map(([name, category]) => [name, samsungCategory(category)]));
        localStorage.setItem("novaphone-product-mappings", JSON.stringify(mappings));
        queueMicrotask(() => setCustomMappings(mappings));
      }
    } catch { /* A hibás helyi adat nem akadályozza a feldolgozást. */ }
  }, []);

  const parsed = useMemo(() => {
    const totals = new Map<string, number>();
    const unknown: Unknown[] = [];
    let validRows = 0;
    let units = 0;
    input.split(/\r?\n/).forEach((line, index) => {
      const item = parseLine(line);
      if (!item) return;
      validRows += 1; units += item.quantity;
      const category = classify(item.name) ?? customMappings[clean(item.name)];
      if (category) totals.set(category, (totals.get(category) ?? 0) + item.quantity);
      else unknown.push({ ...item, row: index + 1, reason: "Nem található egyező kategória" });
    });
    const results: Result[] = CATEGORIES.filter(c => totals.has(c)).map(category => ({ category, quantity: totals.get(category)! }));
    return { results, unknown, validRows, units };
  }, [input, customMappings]);

  const saveAssignments = () => {
    const selected = Object.entries(assignments).filter(([, category]) => category);
    if (!selected.length) return;
    const next = { ...customMappings, ...Object.fromEntries(selected) };
    setCustomMappings(next);
    localStorage.setItem("novaphone-product-mappings", JSON.stringify(next));
    setAssignments({});
  };

  const loadSample = () => {
    setInput("Apple iPhone 15 Pro 128GB\t3\nApple iPad 10.2 8th Gen\t1\nXiaomi Poco X3 NFC\t1\nApple iPhone 13 128GB - 6\nSamsung Galaxy S24 256GB\t4");
    setProcessed(true);
    setActiveTab("summary");
  };

  const download = () => {
    const rows = CATEGORIES.map(category => ({ Kategória: category, Darabszám: parsed.results.find(r => r.category === category)?.quantity ?? 0 }));
    const workbook = XLSX.utils.book_new();
    const summary = XLSX.utils.json_to_sheet(rows);
    summary["!cols"] = [{ wch: 34 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, summary, "Összesítés");
    if (parsed.unknown.length) {
      const unknown = XLSX.utils.json_to_sheet(parsed.unknown.map(r => ({ "Nem felismert termék": r.name, Darabszám: r.quantity })));
      unknown["!cols"] = [{ wch: 55 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, unknown, "Nem felismert");
    }
    XLSX.writeFile(workbook, `erkezo-termekek-osszesites-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand" aria-label="NovaPhone összesítő"><span className="brandMark">N</span><span>NovaPhone</span></div>
        <div className="privacy"><span className="shield">✓</span> HELYI FELDOLGOZÁS</div>
      </header>

      <section className="workspace">
        <div className="panel inputPanel">
          <div><p className="eyebrow">KÉSZLETSEGÉD</p><h1>Érkező termékek összesítő</h1><p className="lead">Másold be a termékneveket és darabszámokat, az oldal a megadott kategóriák szerint összesít.</p></div>
          <label htmlFor="products">ÉRKEZŐ TERMÉKEK</label>
          <div className="editorWrap">
            <textarea id="products" value={input} onChange={e => { setInput(e.target.value); setProcessed(false); }} placeholder={"Apple iPhone 15 Pro 128GB\t3\nApple iPad 10.2 8th Gen\t1\nXiaomi Poco X3 NFC\t1"} spellCheck={false} />
            {input && <button className="clear" onClick={() => { setInput(""); setProcessed(false); }} aria-label="Beviteli mező törlése">×</button>}
          </div>
          <p className="hint">Excelből két oszlop is beilleszthető: terméknév és darabszám. Soronként egy termék.</p>
          <div className="actions">
            <button className="primary" onClick={() => { setProcessed(true); setActiveTab("summary"); }} disabled={!input.trim()}><span>≡</span> Lista feldolgozása</button>
            <button className="secondary" onClick={loadSample}><span>↥</span> Minta betöltése</button>
          </div>
        </div>

        <aside className="panel resultPanel">
          <div><p className="eyebrow">ÉLŐ EREDMÉNY</p><h2>Feldolgozás eredménye</h2></div>
          <div className="stats">
            <div><small>SOR</small><strong>{processed ? parsed.validRows : 0}</strong></div>
            <div><small>DB</small><strong>{processed ? parsed.units : 0}</strong></div>
            <div><small>KATEGÓRIA</small><strong>{processed ? parsed.results.length : 0}</strong></div>
          </div>
          {!processed ? <div className="empty"><span>⌁</span><h3>Az eredmény itt jelenik meg</h3><p>Illeszd be a listát, majd kattints a feldolgozásra.</p></div> : (
            <>
              <div className="tabs" role="tablist" aria-label="Feldolgozási eredmények">
                <button className={activeTab === "summary" ? "active" : ""} onClick={() => setActiveTab("summary")} role="tab">Összesítés <b>{parsed.results.length}</b></button>
                <button className={activeTab === "unknown" ? "active warning" : "warning"} onClick={() => setActiveTab("unknown")} role="tab">Nem felismert <b>{parsed.unknown.length}</b></button>
              </div>
              {activeTab === "summary" ? <div className="tabContent">
                <div className="status"><span>✓</span><b>{parsed.results.length} kategória felismerve</b></div>
                <div className="resultList">
                  {parsed.results.map(item => <div className="resultRow" key={item.category}><span>{item.category}</span><b>{item.quantity} <small>db</small></b></div>)}
                  {!parsed.results.length && <p className="noResult">Nem találtam felismerhető kategóriát.</p>}
                </div>
              </div> : <div className="tabContent unknownTab">
                <div className="mappingIntro"><div><b>Nem egyező termékek besorolása</b><span>Válaszd ki a megfelelő kategóriát. A böngésző megjegyzi a döntést a következő alkalomra is.</span></div><button onClick={saveAssignments} disabled={!Object.values(assignments).some(Boolean)}>Besorolások mentése</button></div>
                <div className="unknownHeader"><span>SOR</span><span>EREDETI TERMÉKNÉV</span><span>DB</span><span>KATEGÓRIA</span></div>
                <div className="unknownList">
                  {parsed.unknown.map((u, i) => { const mappingKey = clean(u.name); return <div className="unknownRow" key={`${u.name}-${i}`}><span>{u.row}.</span><strong>{u.name}</strong><b>{u.quantity}</b><select aria-label={`${u.name} kategóriája`} value={assignments[mappingKey] ?? ""} onChange={e => setAssignments(current => ({ ...current, [mappingKey]: e.target.value }))}><option value="">Kategória kiválasztása…</option>{CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}</select></div>})}
                  {!parsed.unknown.length && <div className="allKnown"><span>✓</span><b>Minden tételt felismertem.</b></div>}
                </div>
              </div>}
            </>
          )}
          <button className="download" onClick={download} disabled={!processed || !parsed.validRows}><span>⇩</span> Excel letöltése</button>
          <p className="localNote">Az adatok nem hagyják el a böngésződet.</p>
        </aside>
      </section>
    </main>
  );
}
