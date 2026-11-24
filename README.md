# Pfoten Royale am See

Website for **Pfoten Royale am See**, a dog grooming salon in Meilen. A plain static site (HTML, CSS, a little
JavaScript) hosted on GitHub Pages at **https://pfotenroyale.ch**: no build step, no framework, no third-party
requests (fonts are self-hosted).

## Structure

```
index.html            single page: hero, Termine, Galerie, Pflegeprodukte, Preise, Kontakt
assets/css/style.css  all styles (colours and fonts are CSS variables at the top)
assets/js/main.js     sticky header, mobile menu, scroll reveal, gallery lightbox
assets/img/           logo, hero, gallery photos, favicons, icons.svg (icon sprite)
assets/fonts/         Cormorant Garamond + Inter (woff2, latin subset)
CNAME                 custom domain (created by GitHub when you set it, see below)
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from disk also works, except for the icons (browsers block the SVG sprite on
`file://`).

## Editing content

- **Prices, texts, opening hours**: edit `index.html`; every section is marked with a `<!-- === ... === -->`
  comment.
- **Prices and the service picker**: the Preise section is also the price calculator. Each option has its
  price in `data-min` / `data-max` (leave out `data-max` for "ab …" prices), the text that goes into the
  WhatsApp / e-mail message in `data-label`, and `data-included` if it is part of the Komplettpflege. Update
  the visible price text next to it as well; the calculator, the summary and the message links follow
  automatically.
- **Phone / WhatsApp / e-mail**: search `index.html` and `assets/js/main.js` for `41765246598` and
  `pfotenroyale@gmail.com`. The WhatsApp links use `https://wa.me/41765246598` with a pre-filled German
  greeting.
- **Gallery photos**: put a JPEG (about 900×1200, under ~200 KB) in `assets/img/gallery/` and copy one of the
  `<li class="gallery-item">` blocks. Keep the `data-index` values sequential (0, 1, 2, …).
- **Online booking (later)**: there is a comment in the `#kontakt` section marking where to drop a booking
  widget or an "Online buchen" button (Calendly, SimplyBook.me, Cal.com, …).

## Deployment (GitHub Pages)

Pages serves the `main` branch from the repository root. Every push to `main` is live within a minute or two.

## Custom domain (moving the domain away from Wix)

1. In the repository: **Settings → Pages → Custom domain**, enter the domain (e.g. `www.example.ch`) and save.
   GitHub commits a `CNAME` file. Tick **Enforce HTTPS** once the certificate has been issued.
2. At the DNS provider (Wix: **Domains → ⋯ → Manage DNS Records**), set:

   | Type  | Host  | Value                                                                                      |
   | ----- | ----- | ------------------------------------------------------------------------------------------ |
   | A     | `@`   | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`                 |
   | AAAA  | `@`   | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | CNAME | `www` | `drew0ps.github.io`                                                                        |

   Remove the existing Wix A/CNAME records for `@` and `www` first.

3. Optional: transfer the domain itself away from Wix to a registrar of your choice (Wix: **Domains → ⋯ →
   Transfer away from Wix** gives you the authorisation code). The DNS records above stay the same.

## Credits

Icons: [Lucide](https://lucide.dev) (ISC) and [Simple Icons](https://simpleicons.org) (CC0). Fonts: Cormorant
Garamond and Inter (SIL Open Font License).
