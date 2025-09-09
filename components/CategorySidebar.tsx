import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';

interface Props {
  categories: string[];
  selected: string[];
  onToggle: (category: string) => void;
}

export default function CategorySidebar({ categories, selected, onToggle }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxHeight: '80%',
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      {categories.map((cat) => {
        const color = getCategoryColor(cat);
        const isSelected = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              border: `2px solid ${color}`,
              backgroundColor: isSelected ? color : 'white',
              color: isSelected ? 'white' : color,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <img src={getMandalaPath(cat)} alt="" style={{ width: '24px', height: '24px' }} />
            <span style={{ whiteSpace: 'nowrap' }}>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}