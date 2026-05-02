---
name: Modar Brand Identity applicata al progetto
description: Colori, font, border radius e stile UI Modar da rispettare nell'app GestionePermessi
type: project
---

Modar S.p.A. ha un brand identity preciso applicato all'intera app.

**Why:** Il brand guide è stato fornito dal cliente ed è già integrato in globals.css e in tutti i componenti.

**How to apply:** Qualsiasi modifica UI deve usare le CSS variables definite in `:root` e `@theme inline` in globals.css. Non usare classi Tailwind blue-* o gray-* ma le variabili Modar.

## Palette principale
- Primario (arancione): `var(--color-primary)` = `#F08F25`
- Hover: `var(--color-primary-dark)` = `#C06A10`
- Sfondo pagine: `var(--color-offwhite)` = `#F5F2EE`
- Testo principale: `var(--color-black)` = `#1A1918`
- Testo secondario: `var(--color-grey-mid)` = `#6B6560`
- Icone/bordi: `var(--color-grey-icon)` = `#A4A4A6`

## Font
- Titoli: `var(--font-display)` = Cormorant Garamond (class: `font-semibold`, font-size grandi)
- UI/body: `var(--font-ui)` = Jost

## Border radius
- Badge/tag: `var(--radius-badge)` = 2px
- Bottoni e card: `var(--radius-button)` = 4px
- Modal/drawer: `var(--radius-modal)` = 8px

## Bottoni primari
- Sfondo arancione `#F08F25`, testo bianco, `font-bold uppercase tracking-widest`
- Label: sempre uppercase con letter-spacing

## Logo (componente LogoModar)
- Simbolo: 4 barre orizzontali SVG in grigio `#A4A4A6`
- Wordmark: "MODAR" bold uppercase arancione `#F08F25`
- Componente: `src/components/LogoModar.tsx`, prop `size`: sm|md|lg
