import React from 'react';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import SimpleProgress from '@/components/SimpleProgress';
import { caffeineToPct } from '@/utils/teaTransforms';
import { scaleTea } from 'lib/teaScaling';

type Props = {
  tea: any;
  colorDark: string;
};

export default function IngredientCaffeinePanel({ tea, colorDark }: Props) {
  const scaled = scaleTea(tea, { cups: 1, strengthMultiplier: 1 });
  const ingredients = scaled.perIngredient;
  const caffeine = caffeineToPct(tea);

  const formatTkLabel = (value: number) => `~${Number(value.toFixed(2))} tk`;
  const legendColumns = Math.max(ingredients.length, 1);

  return (
    <div style={{ display:'grid', gridTemplateRows:'auto auto', gap:24 }}>
      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <IngredientsStack items={ingredients} />
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${legendColumns},minmax(0,1fr))`, gap:12, marginTop:12 }}>
          {ingredients.map((ing) => (
            <div key={ing.name} style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700 }}>{formatTkLabel(ing.tkRounded)}</div>
              <div style={{ opacity:.85 }}>{ing.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:16, borderRadius:12, background:'rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between' }}>
          <span>Koffein</span>
          <strong>{Math.round(caffeine)}%</strong>
        </div>
        <SimpleProgress value={caffeine} color={colorDark} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:12 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700 }}>{Math.round(caffeine)}%</div>
            <div style={{ opacity:.85 }}>tartalom</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700 }}>{caffeine > 0 ? 'igen' : 'nem'}</div>
            <div style={{ opacity:.85 }}>van-e</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700 }}>100%</div>
            <div style={{ opacity:.85 }}>skála</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:700 }}>—</div>
            <div style={{ opacity:.85 }}>megjegyzés</div>
          </div>
        </div>
      </div>
    </div>
  );
}
