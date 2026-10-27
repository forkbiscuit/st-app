import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: Variant;
  icon?: string;
  iconAfter?: string;
  /** 0–1. Fills the button left to right (used while a movement timer runs). */
  progress?: number;
  /**
   * Looks disabled but stays focusable and clickable, so it can explain
   * why it can't be used yet (see onClick handlers that show a hint).
   */
  inactive?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', icon, iconAfter, progress, inactive, className = '', children, ...rest },
  ref,
) {
  const hasProgress = typeof progress === 'number';
  return (
    <button
      ref={ref}
      type="button"
      className={`btn btn-${variant}${hasProgress ? ' has-progress' : ''}${inactive ? ' is-inactive' : ''} ${className}`}
      aria-disabled={inactive || undefined}
      {...rest}
    >
      {hasProgress && (
        <span className="btn-fill" style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress!))})` }} />
      )}
      <span className="btn-label">
        {icon && <Icon name={icon} />}
        {children}
        {iconAfter && <Icon name={iconAfter} />}
      </span>
    </button>
  );
});

export function IconButton({
  icon,
  label,
  filled,
  pressed,
  className = '',
  ...rest
}: { icon: string; label: string; filled?: boolean; pressed?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      {...rest}
    >
      <Icon name={icon} filled={filled} />
    </button>
  );
}
