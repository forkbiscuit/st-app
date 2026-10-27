/** Material Symbols Rounded, self-hosted via the `material-symbols` package. Decorative by default. */
export function Icon({ name, filled = false, size }: { name: string; filled?: boolean; size?: number }) {
  return (
    <span
      className="icon"
      aria-hidden="true"
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        fontSize: size,
      }}
    >
      {name}
    </span>
  );
}
