'use client';

import { notFound, useParams } from 'next/navigation';
import { TECHNIQUES } from '@/lib/breathing-techniques';
import type { BreathingTechniqueId } from '@/lib/types';
import { BoxTechniqueSession } from '@/components/techniques/BoxTechniqueSession';
import { SighSession } from '@/components/techniques/SighSession';
import { WimHofSession } from '@/components/techniques/WimHofSession';
import { PmrSession } from '@/components/techniques/PmrSession';

export default function TechniqueSessionPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as BreathingTechniqueId | undefined;
  const technique = id ? TECHNIQUES[id] : undefined;

  if (!technique) {
    notFound();
  }

  switch (technique.config.kind) {
    case 'box':
      return <BoxTechniqueSession technique={technique} />;
    case 'sigh':
      return <SighSession technique={technique} />;
    case 'wim-hof':
      return <WimHofSession technique={technique} />;
    case 'pmr':
      return <PmrSession technique={technique} />;
  }
}
