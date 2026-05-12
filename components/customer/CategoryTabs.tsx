interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
            activeCategory === cat
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-105'
              : 'bg-surface-muted text-ink-secondary hover:bg-surface-border'
          }`}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
};
