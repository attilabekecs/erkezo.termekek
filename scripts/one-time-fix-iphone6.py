from pathlib import Path

p = Path("app/page.tsx")
s = p.read_text()

old_categories = '  "iPhone 6", "iPhone 6s", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus",'
new_categories = '  "iPhone 6", "iPhone 6 Plus", "iPhone 6s", "iPhone 6s Plus", "iPhone 7", "iPhone 7 Plus", "iPhone 8", "iPhone 8 Plus",'
if old_categories in s:
    s = s.replace(old_categories, new_categories, 1)
elif new_categories not in s:
    raise SystemExit("Category anchor not found")

start_marker = '  if (has(/iphone\\s*6\\s*s\\b|iphone\\s*6s\\b/)) return "iPhone 6s";'
end_marker = '  if (has(/iphone\\s*xs\\s*max/)) return "iPhone XS Max";'
start = s.find(start_marker)
end = s.find(end_marker, start if start >= 0 else 0)
if start < 0 or end < 0:
    raise SystemExit("Classifier anchors not found")

replacement = '''  if (has(/iphone\\s*6\\s*s\\s*plus\\b|iphone\\s*6s\\s*plus\\b/)) return "iPhone 6s Plus";
  if (has(/iphone\\s*6\\s*s\\b|iphone\\s*6s\\b/)) return "iPhone 6s";
  if (has(/iphone\\s*6\\s*plus\\b/)) return "iPhone 6 Plus";
  if (has(/iphone\\s*6(?!\\s*s\\b|s\\b|\\d)/)) return "iPhone 6";
  for (const model of [8, 7]) {
    const pattern = new RegExp(`iphone\\\\s*${model}(?!\\\\d)`);
    if (has(pattern)) return has(/\\bplus\\b/) ? `iPhone ${model} Plus` : `iPhone ${model}`;
  }
'''
s = s[:start] + replacement + s[end:]

old_logic = '''      if (category) {
        totals.set(category, (totals.get(category) ?? 0) + item.quantity);
        keptUnits += item.quantity;
      } else unknown.push({ ...item, row: index + 1, reason: "Nem található egyező kategória" });'''
new_logic = '''      if (category && CATEGORIES.includes(category as typeof CATEGORIES[number])) {
        totals.set(category, (totals.get(category) ?? 0) + item.quantity);
        keptUnits += item.quantity;
      } else unknown.push({ ...item, row: index + 1, reason: category ? `Nem exportálható kategória: ${category}` : "Nem található egyező kategória" });'''
if old_logic in s:
    s = s.replace(old_logic, new_logic, 1)
elif new_logic not in s:
    raise SystemExit("Kept-units anchor not found")

p.write_text(s)
