'use client';
import { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
};

/** Label + input + hint/error, per the DS input anatomy. */
export function Field({ label, hint, error, id, className = '', ...rest }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`input ${error ? 'is-invalid' : ''} ${className}`} {...rest} />
      {error ? (
        <span className="err-msg">{error}</span>
      ) : hint ? (
        <span className="hint">{hint}</span>
      ) : null}
    </div>
  );
}
