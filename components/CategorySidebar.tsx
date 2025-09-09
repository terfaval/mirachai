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
        const mainColor = getCategoryColor(cat);
        const lightColor = getCategoryColor(cat, 'light');
        const isSelected = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`category-btn${isSelected ? ' selected' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              border: 'none',
              backgroundColor: mainColor,
              color: '#fff',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                mask: `url(${getMandalaPath(cat)}) no-repeat center / contain`,
                WebkitMask: `url(${getMandalaPath(cat)}) no-repeat center / contain`,
                backgroundColor: lightColor,
                width: '24px',
                height: '24px',
                flexShrink: 0,
              }}
            />
            <span className="label" style={{ whiteSpace: 'nowrap' }}>
              {cat}
            </span>
          </button>
        );
      })}
      <style jsx>{`
        .category-btn .label {
          display: none;
        }
        .category-btn:hover .label,
        .category-btn.selected .label {
          display: inline;
        }
      `}</style>
    </div>
  );
}