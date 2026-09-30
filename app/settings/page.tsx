import { PageShell } from '@/components/shared/PageShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { SoundSection } from '@/components/settings/SoundSection';
import { PracticeSection } from '@/components/settings/PracticeSection';
import { MotionSection } from '@/components/settings/MotionSection';
import { DataSection } from '@/components/settings/DataSection';

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader back={{ href: '/', label: 'Главная' }} title="Настройки" />
      <SoundSection />
      <PracticeSection />
      <MotionSection />
      <DataSection />
    </PageShell>
  );
}
