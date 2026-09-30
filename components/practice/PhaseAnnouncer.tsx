type Props = { text: string };

// Объявляет смену фазы программе чтения с экрана; на экране не виден.
export function PhaseAnnouncer({ text }: Props) {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      {text}
    </div>
  );
}
