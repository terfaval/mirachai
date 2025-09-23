import { describe, expect, it } from 'vitest';

import { equipmentFallbackIcon, getEquipmentIcon, normalizeGear } from '@/utils/equipment';

describe('normalizeGear', () => {
  it('merges agar and gelling aliases', () => {
    expect(normalizeGear([' agar/zselésítő ', 'pecsétgyanta', 'Agar'])).toEqual(['agar/zselésítő']);
  });

  it('splits gaiwan and yi xing kanna into separate entries', () => {
    expect(normalizeGear(['gaiwan/yi xing kanna', 'gaiwan, yi xing kanna'])).toEqual(['gaiwan', 'yi xing kanna']);
  });

  it('maps jar and bottle family to canonical labels', () => {
    expect(normalizeGear(['pohár / palack', 'tárolóüveg (befőttes üveg)', 'palack'])).toEqual([
      'palack',
      'befőttes üveg',
    ]);
  });

  it('keeps csapolófej combined alias as a single item', () => {
    expect(normalizeGear(['csapolófej/pohár'])).toEqual(['csapolófej']);
  });

  it('normalizes soda siphon aliases', () => {
    expect(normalizeGear(['szódás palack vagy szóda'])).toEqual(['szóda palack']);
  });

  it('produces stable snapshots for representative methods', () => {
    const experimentalTexture = normalizeGear([
      'teáskanna',
      'szűrő',
      'agar/pecsétgyanta vagy zselésítő',
      'botmixer',
    ]);
    expect(experimentalTexture).toMatchInlineSnapshot(`
      [
        "teáskanna",
        "szűrő/szűrőpapír/szita",
        "agar/zselésítő",
        "botmixer",
      ]
    `);

    const sparklingTea = normalizeGear([
      'szódás palack vagy szóda',
      'mini keg',
      'N₂ patron',
      'csapolófej/pohár',
    ]);
    expect(sparklingTea).toMatchInlineSnapshot(`
      [
        "szóda palack",
        "mini keg",
        "N₂ patron",
        "csapolófej",
      ]
    `);

    const gongfu = normalizeGear([
      'gaiwan/yi xing kanna',
      'yi xing kanna',
      'chashaku',
    ]);
    expect(gongfu).toMatchInlineSnapshot(`
      [
        "gaiwan",
        "yi xing kanna",
        "chashaku",
      ]
    `);
  });
});

describe('getEquipmentIcon', () => {
  it('resolves agar family to the gel icon', () => {
    expect(getEquipmentIcon('agar')).toBe('/teasets/icon_gel.svg');
    expect(getEquipmentIcon('zselesito')).toBe('/teasets/icon_gel.svg');
  });

  it('distinguishes between gaiwan and yi xing kanna icons', () => {
    expect(getEquipmentIcon('gaiwan')).toBe('/teasets/icon_gaiwan.svg');
    expect(getEquipmentIcon('yi xing kanna')).toBe('/teasets/icon_yixing.svg');
  });

  it('maps the bottle family correctly', () => {
    expect(getEquipmentIcon('palack')).toBe('/teasets/icon_bottle.svg');
    expect(getEquipmentIcon('szódás palack vagy szóda')).toBe('/teasets/icon_soda.svg');
    expect(getEquipmentIcon('tárolóüveg (befőttes üveg)')).toBe('/teasets/icon_jar.svg');
    expect(getEquipmentIcon('zárható üveg')).toBe('/teasets/icon_bottle_lock.svg');
  });

  it('falls back to the missing icon for unknown items', () => {
    expect(getEquipmentIcon('űrhajó')).toBe(equipmentFallbackIcon);
  });
});