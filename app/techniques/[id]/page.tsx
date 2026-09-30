'use client';

import { notFound, useParams } from 'next/navigation';
import { TechniqueShell } from '@/components/techniques/TechniqueShell';
import { findTechnique } from '@/lib/breathing-techniques';

export default function TechniqueSessionPage() {
  const params = useParams<{ id: string }>();
  const technique = findTechnique(params?.id);

  if (!technique) {
    notFound();
  }

  return <TechniqueShell key={technique.id} technique={technique} />;
}
