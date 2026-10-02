import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { isExternalUrl } from '@/lib/utils';

export interface ActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Internal route — renders a react-router `<Link>`. */
  to?: string;
  /** URL — renders an `<a>`; external URLs open in a new tab safely. */
  href?: string;
}

/**
 * Unstyled polymorphic action: `<button>`, `<Link>` or `<a>` depending on props.
 * Every button-like control builds on this so routing and link safety live in
 * exactly one place.
 */
export const Action = forwardRef<HTMLButtonElement, ActionProps>(function Action(
  { to, href, className, children, disabled, ...rest },
  ref,
) {
  if (to) {
    return (
      <Link
        to={to}
        className={className}
        aria-disabled={disabled}
        aria-label={rest['aria-label']}
        title={rest.title}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    const external = isExternalUrl(href);
    return (
      <a
        href={href}
        className={className}
        aria-label={rest['aria-label']}
        title={rest.title}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} className={className} disabled={disabled} {...rest}>
      {children}
    </button>
  );
});
