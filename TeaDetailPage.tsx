import React from 'react';
import { Tea } from './src/types/tea';
import TeaTitle from './components/TeaTitle';
import CategoryPills from './components/CategoryPills';
import TasteChart from './components/panels/TasteChart';
import FunctionRadialSteps from './components/panels/FunctionRadialSteps';
import IntensityDots from './components/panels/IntensityDots';
import DonutPercent from './components/panels/DonutPercent';
import IngredientsStack from './components/ingredients/IngredientsStack';
import ColorCup from './components/ColorCup';
import SimpleProgress from './components/SimpleProgress';
import ServeModes from './components/ServeModes';

interface Props {
  tea: Tea;
  colorScale: Record<string, string>;
  categoryColors: Record<string, string>;
}

export default function TeaDetailPage({ tea, colorScale, categoryColors }: Props) {
  const categoryColor = categoryColors[tea.category] || '#000';
  const percent = (tea.intensity / 3) * 100;
  const descClass = tea.descriptionDisplayAsTitanOne
    ? 'font-display lowercase'
    : 'font-sans';
  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <TeaTitle name={tea.name} />
      <CategoryPills
        category={tea.category}
        subcategory={tea.subcategory}
        categoryColors={categoryColors}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <TasteChart taste={tea.taste} />
        <FunctionRadialSteps functions={tea.functions} color={categoryColor} />
        <IntensityDots intensity={tea.intensity} />
        <DonutPercent percent={percent} color={categoryColor} />
      </div>
      {tea.description && (
        <p
          className={`${descClass} text-center mx-auto max-w-prose mb-8 text-lg`}
        >
          {tea.description}
        </p>
      )}
      <IngredientsStack ingredients={tea.ingredients} colorScale={colorScale} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 items-center">
        <ColorCup color={tea.color} />
        <div className="space-y-4">
          <SimpleProgress
            label="Hőmérséklet"
            value={tea.tempC}
            max={100}
            endLabel={`${tea.tempC}°C`}
            color={categoryColor}
          />
          <SimpleProgress
            label="Áztatási idő"
            value={parseInt(String(tea.steepMin), 10) || 0}
            max={15}
            endLabel={`${tea.steepMin} perc`}
            color={categoryColor}
          />
        </div>
      </div>
      <ServeModes tea={tea} />
    </div>
  );
}