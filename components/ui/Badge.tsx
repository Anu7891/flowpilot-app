import { HTMLAttributes } from 'react';

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  dot?: boolean;
};

export function Badge({ variant = 'neutral', dot, className = '', children, ...rest }: Props) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...rest}>
      {dot && <span className="bdot" />}
      {children}
    </span>
  );
}
