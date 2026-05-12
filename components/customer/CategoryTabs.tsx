interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
            activeCategory === cat
              ? 'bg-ink-primary text-ink-inverse border-ink-primary shadow-md'
              : 'bg-surface-white text-ink-secondary border-surface-border hover:bg-surface-soft hover:border-ink-muted'
          }`}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
};
