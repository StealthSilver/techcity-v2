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
