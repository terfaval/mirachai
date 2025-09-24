import { describe, it, expect } from 'vitest';
import { computeRelevance, type RelevanceCtx, type Tea } from '../utils/relevance';

const makeTea = (partial: Partial<Tea>): Tea => ({
  id: 1,
  name: 't',
  serve_hot: 'TRUE',
  ...partial,
});

const ctxForDate = (date: Date): RelevanceCtx => ({
  seedISODate: date.toISOString().slice(0, 10),
  hourLocal: date.getHours(),
});

describe('computeRelevance seasonal and daypart priority', () => {
  it('prioritizes teas for the current and nearby seasons', () => {
    const ctx = ctxForDate(new Date('2023-08-01T12:00:00'));
    const summer = computeRelevance(makeTea({ season_recommended: ['nyár'] }), ctx);
    const spring = computeRelevance(makeTea({ season_recommended: ['tavasz'] }), ctx);
    const autumn = computeRelevance(makeTea({ season_recommended: ['ősz'] }), ctx);
    const winter = computeRelevance(makeTea({ season_recommended: ['tél'] }), ctx);
    const evergreen = computeRelevance(makeTea({ season_recommended: ['egész évben'] }), ctx);

    expect(summer).toBeGreaterThan(spring);
    expect(spring).toBe(autumn);
    expect(autumn).toBeGreaterThan(winter);
    expect(evergreen).toBeGreaterThan(0);
  });

  it('prefers after meal teas at lunch time', () => {
    const now = new Date('2023-08-01T14:00:00');
    const afterMeal = makeTea({ daypart_recommended: ['étkezés_után'] });
    const earlyAfternoon = makeTea({ daypart_recommended: ['kora_délután'] });
    const ctx = ctxForDate(now);
    expect(computeRelevance(earlyAfternoon, ctx)).toBeGreaterThan(
      computeRelevance(afterMeal, ctx)
    );
  });

  it('boosts before bed teas after 20:00', () => {
    const now = new Date('2023-08-01T21:30:00');
    const beforeBed = makeTea({ daypart_recommended: ['lefekvés_előtt'] });
    const afterMeal = makeTea({ daypart_recommended: ['étkezés_után'] });
    const ctx = ctxForDate(now);
    expect(computeRelevance(beforeBed, ctx)).toBeGreaterThan(
      computeRelevance(afterMeal, ctx)
    );
  });
});