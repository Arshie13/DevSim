import { getRewardUnlockIds } from './learnerPassRewards';

describe('getRewardUnlockIds', () => {
  it('uses unlocked_scenario from the current reward schema', () => {
    const unlocks = getRewardUnlockIds({ unlocked_scenario: ['scenario-1', 'scenario-2'] });
    expect(unlocks).toEqual(['scenario-1', 'scenario-2']);
  });

  it('falls back to the legacy unlocks property when present', () => {
    const unlocks = getRewardUnlockIds({ unlocks: ['legacy-scenario'] });
    expect(unlocks).toEqual(['legacy-scenario']);
  });

  it('returns an empty array when no unlocks are available', () => {
    const unlocks = getRewardUnlockIds(null);
    expect(unlocks).toEqual([]);
  });
});
