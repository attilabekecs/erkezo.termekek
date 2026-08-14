from pathlib import Path

p = Path("app/page.tsx")
s = p.read_text()

old = '''            <textarea id="products" value={input} onChange={e => { setInput(e.target.value); setProcessed(false); }} placeholder={"Apple iPhone 15 Pro 128GB\\t3\\nApple iPad 10.2 8th Gen\\t1\\nXiaomi Poco X3 NFC\\t1"} spellCheck={false} />'''
new = '''            <textarea id="products" value={input} onChange={e => { setInput(e.target.value); setProcessed(false); }} onPaste={e => { e.preventDefault(); const pasted = e.clipboardData.getData("text/plain").replace(/\\r\\n?/g, "\\n"); const el = e.currentTarget; const start = el.selectionStart ?? input.length; const end = el.selectionEnd ?? start; const next = input.slice(0, start) + pasted + input.slice(end); setInput(next); setProcessed(false); requestAnimationFrame(() => { el.focus(); const cursor = start + pasted.length; el.setSelectionRange(cursor, cursor); el.scrollTop = 0; el.scrollLeft = 0; }); }} placeholder={"Apple iPhone 15 Pro 128GB\\t3\\nApple iPad 10.2 8th Gen\\t1\\nXiaomi Poco X3 NFC\\t1"} spellCheck={false} />'''

if new in s:
    raise SystemExit(0)
if old not in s:
    raise SystemExit("textarea target not found")

p.write_text(s.replace(old, new, 1))
