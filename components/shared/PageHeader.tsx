import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  back?: { href: string; label: string };
  title?: string;
  right?: ReactNode;
};

export function PageHeader({ back, title, right }: Props) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4 text-sm text-text-secondary">
      {back && (
        <Link
          href={back.href}
          className="tap-target transition-colors hover:text-text-primary"
        >
          <span aria-hidden>← </span>
          {back.label}
        </Link>
      )}
      {title && <h1>{title}</h1>}
      {right}
    </header>
  );
}
