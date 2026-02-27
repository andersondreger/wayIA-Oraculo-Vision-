import {RiskProfile} from '../types';
import {cn} from '../lib/utils';

export function RiskProfileSelector({
  selectedProfile,
  onSelectProfile,
}: {
  selectedProfile: RiskProfile;
  onSelectProfile: (profile: RiskProfile) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-secondary">
      {Object.values(RiskProfile).map((profile) => (
        <button
          key={profile}
          onClick={() => onSelectProfile(profile)}
          className={cn(
            'px-4 py-1.5 text-sm font-semibold rounded-full transition-colors',
            selectedProfile === profile
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-primary/10',
          )}
        >
          {profile}
        </button>
      ))}
    </div>
  );
}
