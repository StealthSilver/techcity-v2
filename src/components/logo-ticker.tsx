/* eslint-disable @next/next/no-img-element */

/**
 * Partner logo ticker for the bottom of the hero, modelled on stripe.com's hero
 * carousel: a hairline-topped band of logos drifting left at a slow, constant
 * speed. It sits *under* the globe, so logos appear to start from behind it.
 *
 * Logos are pre-processed copies in public/logos/ticker (trimmed, transparent
 * backgrounds, WebP). The originals in public/logos are left untouched.
 */
const partners = [
  { slug: "akgec", name: "Ajay Kumar Garg Engineering College" },
  { slug: "kiet", name: "KIET University" },
  { slug: "echelon", name: "Echelon Institute of Technology" },
  { slug: "chitkara", name: "Chitkara University" },
  { slug: "inmantec", name: "Inmantec Institutions" },
  { slug: "kcnit", name: "KCNIT Group of Institutions, Banda" },
  { slug: "st-andrews", name: "St. Andrews Institute of Technology and Management" },
  { slug: "chandigarh", name: "Chandigarh University" },
  { slug: "shobhit", name: "Shobhit University" },
  { slug: "jpu-chapra", name: "Jai Prakash Vishwavidyalaya, Chapra" },
  { slug: "adhunik", name: "Adhunik Group of Institutions" },
  { slug: "sms-lucknow", name: "School of Management Sciences, Lucknow" },
  { slug: "lpu", name: "Lovely Professional University" },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="logo-ticker-row" aria-hidden={hidden || undefined}>
      {partners.map((p) => (
        <li key={p.slug} className="logo-ticker-item">
          <img src={`/logos/ticker/${p.slug}.webp`} alt={hidden ? "" : p.name} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  );
}

export function LogoTicker({ className = "" }: { className?: string }) {
  return (
    <div className={`logo-ticker ${className}`}>
      <p className="sr-only">Partner colleges and universities</p>
      {/* Two identical rows; the track slides by exactly one row for a seamless loop. */}
      <div className="logo-ticker-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
