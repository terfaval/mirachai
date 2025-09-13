import { describe, it, expect } from 'vitest';
import { calcGrams, gramsToTsp, buildSteps, getEquipmentHowTo, BrewProfile } from '../src/brewing';

describe('brewing api', () => {
  it('calcGrams computes rounded grams', () => {
    expect(calcGrams(2.5, 250, 0.1)).toBe(6.3);
  });

  it('gramsToTsp converts grams to tsp', () => {
    expect(gramsToTsp(6.3, 2.1)).toBeCloseTo(3.0, 5);
  });

  it('buildSteps includes gram text', () => {
    const profile: BrewProfile = {
      profile_id: 'hot_standard',
      label: 'Hot',
      equipment: [],
      water_temp_c: 95,
      ratio_g_per_100ml: 1.08,
      time_s: 360,
      rounding_g: 0.1,
      notes_per_step: {},
      flavor_suggestions: [{ hint: 'méz', dose: '0.5–1 tk / 250 ml', when: 'áztatás után' }],
      finish_message: 'Kész!',
    };
    const { steps } = buildSteps(profile, 500, 1.8);
    expect(steps[2].action).toContain('g teát');
  });

  it('getEquipmentHowTo returns guide with steps', async () => {
    const guide = await getEquipmentHowTo('gaiwan');
    expect(guide?.steps.length).toBeGreaterThan(0);
  });
});