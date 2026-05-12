interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 border ${
            activeCategory === cat
              ? 'bg-brand-500 text-ink-inverse border-brand-500 shadow-sm'
              : 'bg-surface-white text-ink-secondary border-surface-border hover:bg-surface-muted'
          }`}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
};
