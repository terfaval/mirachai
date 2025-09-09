import { describe, it, expect } from 'vitest';
import { computeRelevance } from '../pages/index';
import { Tea } from '../utils/filter';

const makeTea = (partial: Partial<Tea>): Tea => ({
  id: 1,
  name: 't',
  category: 'c',
  ...partial,
});

describe('computeRelevance seasonal and daypart priority', () => {
  it('prioritizes teas for current and upcoming seasons', () => {
    const now = new Date('2023-08-01T12:00:00');
    const onlySummer = makeTea({ season_recommended: ['nyár'] });
    const summerAutumn = makeTea({ season_recommended: ['nyár', 'ősz'] });
    const summerSpring = makeTea({ season_recommended: ['nyár', 'tavasz'] });
    const autumnOnly = makeTea({ season_recommended: ['ősz'] });

    const s1 = computeRelevance(onlySummer, now);
    const s2 = computeRelevance(summerAutumn, now);
    const s3 = computeRelevance(summerSpring, now);
    const s4 = computeRelevance(autumnOnly, now);

    expect(s1).toBeGreaterThan(s2);
    expect(s2).toBeGreaterThan(s3);
    expect(s3).toBeGreaterThan(s4);
  });

  it('prefers after meal teas at lunch time', () => {
    const now = new Date('2023-08-01T12:30:00');
    const afterMeal = makeTea({ daypart_recommended: ['étkezés_után'] });
    const earlyAfternoon = makeTea({ daypart_recommended: ['kora_délután'] });
    expect(computeRelevance(afterMeal, now)).toBeGreaterThan(
      computeRelevance(earlyAfternoon, now)
    );
  });

  it('boosts before bed teas after 20:00', () => {
    const now = new Date('2023-08-01T20:30:00');
    const beforeBed = makeTea({ daypart_recommended: ['lefekvés_előtt'] });
    const afterMeal = makeTea({ daypart_recommended: ['étkezés_után'] });
    expect(computeRelevance(beforeBed, now)).toBeGreaterThan(
      computeRelevance(afterMeal, now)
    );
  });
});