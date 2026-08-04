# Érkező termékek összesítő

NovaPhone belső segédoldal beérkező terméklisták kategóriánkénti összesítéséhez.

## Funkciók

- Excelből kimásolt terméknév–darabszám lista feldolgozása
- automatikus Apple, Samsung, Huawei és Xiaomi kategóriafelismerés
- külön „Nem felismert” fül
- nem felismert termékek kézi besorolása
- a kézi besorolások megjegyzése a böngészőben
- teljes összesítés letöltése XLSX-fájlként
- helyi adatfeldolgozás: a beillesztett lista nem kerül szerverre
- teljes képernyős asztali felület és reszponzív mobilnézet

## Helyi indítás

Feltételek:

- Node.js 22.13 vagy újabb
- npm

Telepítés és indítás:

```bash
npm install
npm run dev
```

A terminálban megjelenő helyi címet nyisd meg böngészőben.

## Ellenőrzés és production build

```bash
npm run lint
npm run build
```

## GitHub feltöltés

1. Csomagold ki a ZIP-fájlt.
2. Hozz létre egy új, üres GitHub repositoryt.
3. Töltsd fel a kicsomagolt mappa tartalmát a repository gyökerébe.

Parancssorból:

```bash
git init
git add .
git commit -m "Érkező termékek összesítő"
git branch -M main
git remote add origin https://github.com/FELHASZNALO/REPOSITORY.git
git push -u origin main
```

## Fontos fájlok

- `app/page.tsx` – feldolgozás, kategóriafelismerés és Excel-export
- `app/globals.css` – teljes megjelenés és reszponzív elrendezés
- `package.json` – futtatási és build parancsok

## Adattárolás

A kézzel megadott termék–kategória párosítások a böngésző `localStorage` tárhelyére kerülnek. Emiatt ugyanazon a böngészőn később automatikusan felismerhetők, de másik számítógépre vagy böngészőbe nem kerülnek át.
