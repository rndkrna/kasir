interface SoundToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const SoundToggle = ({ isEnabled, onToggle }: SoundToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
        isEnabled
          ? 'bg-[#cefda3] border-[#385e16] text-[#2b5008]'
          : 'bg-[#fafaf5] border-[#eeeee9] text-[#43493c]'
      }`}
      title={isEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
    >
      <div className="relative w-4 h-4">
        {isEnabled ? (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </div>
      <span className="text-xs font-bold uppercase tracking-tight">
        {isEnabled ? 'Bunyi On' : 'Bunyi Off'}
      </span>
    </button>
  );
};
