/** The UpDown mark: an ember arrow up (warm-up) beside a tide arrow down (cool-down). */
export function LogoMark({ size = 32, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg
      className={animated ? 'logo-mark is-animated' : 'logo-mark'}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <g className="logo-up">
        <path d="M11 25V8m0 0-5 5m5-5 5 5" stroke="var(--ember-1)" />
      </g>
      <g className="logo-down">
        <path d="M21 7v17m0 0-5-5m5 5 5-5" stroke="var(--tide-1)" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark size={28} />
      <span className="logo-word">UpDown</span>
    </span>
  );
}
