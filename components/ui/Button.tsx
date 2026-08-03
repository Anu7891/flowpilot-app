'use client';
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'lg';
};

/** FlowPilot DS button. Uses the token-driven .btn classes. */
export function Button({ variant = 'primary', size, className = '', ...rest }: Props) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className]
    .filter(Boolean)
    .join(' ');
  return <button className={cls} {...rest} />;
}
