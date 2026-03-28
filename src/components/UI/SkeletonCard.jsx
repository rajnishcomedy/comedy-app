import React from 'react';

export function SkeletonCard({ height = 180, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        height,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        ...style,
      }}
    />
  );
}

export function SkeletonGrid({ count = 6, minW = 400, height = 180 }) {
  return (
    <div style={{
      display: 'grid',
      gap: 16,
      gridTemplateColumns: `repeat(auto-fill, minmax(${minW}px, 1fr))`,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  );
}
