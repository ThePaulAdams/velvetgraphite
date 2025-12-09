'use client';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({
  tags,
  selectedTag,
  onSelectTag,
}: TagFilterProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-200">Filter by Tag</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectTag(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedTag === null
              ? 'bg-pink-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedTag === tag
                ? 'bg-pink-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
