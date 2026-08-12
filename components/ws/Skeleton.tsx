'use client';
/** Shimmer placeholder block. Token-based, so it adapts to light/dark. */
import type { CSSProperties } from 'react';

export default function Skeleton({
  w,
  h = 12,
  r = 6,
  style,
}: {
  w?: number | string;
  h?: number | string;
  r?: number;
  style?: CSSProperties;
}) {
  return <span className="fp-skel" style={{ width: w ?? '100%', height: h, borderRadius: r, ...style }} />;
}
