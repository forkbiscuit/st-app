import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** Back link on the left, optional actions on the right. */
export function TopBar({
  backLabel,
  onBack,
  right,
  center,
}: {
  backLabel?: string;
  onBack?: () => void;
  right?: ReactNode;
  center?: ReactNode;
}) {
  return (
    <header className="topbar">
      {onBack ? (
        <button type="button" className="back-btn" onClick={onBack}>
          <Icon name="arrow_back" />
          <span>{backLabel ?? 'Back'}</span>
        </button>
      ) : (
        <span />
      )}
      {center}
      <div className="topbar-right">{right}</div>
    </header>
  );
}
