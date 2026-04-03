import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  selectedId: number;
  onSelect: (id: number) => void;
  onAddCategory: (name: string, icon: string) => void;
  onDeleteCategory: (id: number) => void;
}

const ICON_OPTIONS = ['📁', '🚀', '🔨', '🧹', '🔧', '📦', '🧪', '🔍', '⚙️', '📊', '🌐', '💾'];

export function CategoryList({ categories, selectedId, onSelect, onAddCategory, onDeleteCategory }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddCategory(trimmed, icon);
    setName('');
    setIcon('📁');
    setAdding(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">分类</h2>
        <button
          onClick={() => setAdding(!adding)}
          className="p-0.5 rounded hover:bg-accent transition-colors"
          title="新建分类"
        >
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {adding && (
        <div className="px-3 pb-2 space-y-2">
          <div className="flex gap-1 flex-wrap">
            {ICON_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                className={cn(
                  'w-7 h-7 text-sm rounded flex items-center justify-center transition-colors',
                  icon === e ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-accent'
                )}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="分类名称"
              autoFocus
              className="flex-1 px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleSubmit}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              添加
            </button>
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat.id} className="group relative">
          <button
            onClick={() => onSelect(cat.id)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              selectedId === cat.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
          {cat.name !== '全部' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-opacity"
              title="删除分类"
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
