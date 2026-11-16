/**
 * Chevron that grows a stem and slides right when the parent link/button is hovered.
 * `reveal` keeps it hidden until hover (used on dropdown items).
 */
export function HoverArrow({ reveal = false }: { reveal?: boolean }) {
  return (
    <svg
      className={`hover-arrow ${reveal ? "hover-arrow--reveal" : ""}`}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <path className="hover-arrow__line" d="M0 5h7" />
      <path className="hover-arrow__tip" d="M1 1l4 4-4 4" />
    </svg>
  );
}

/**
 * Slanted ↗ arrow for links that leave the site and open in a new tab.
 * Nudges up and right when the parent link is hovered. `reveal` as above.
 */
export function ExternalArrow({ reveal = false }: { reveal?: boolean }) {
  return (
    <svg
      className={`hover-arrow hover-arrow--external ${reveal ? "hover-arrow--reveal" : ""}`}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <path className="hover-arrow__tip" d="M1.5 8.5L8.5 1.5M3 1.5h5.5V7" />
    </svg>
  );
}

/** Props that make an <a> open in a new tab safely. */
export const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;
