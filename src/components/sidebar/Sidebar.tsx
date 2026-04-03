import { useState } from 'react';
import { Search, Plus, FolderOpen } from 'lucide-react';
import type { Category, Script } from '@/lib/types';
import { CategoryList } from './CategoryList';
import { ScriptList } from './ScriptList';

interface Props {
  categories: Category[];
  selectedCategoryId: number;
  onSelectCategory: (id: number) => void;
  scripts: Script[];
  selectedScriptId: number | null;
  onSelectScript: (script: Script) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onAddScript: () => void;
  onImportScripts: () => void;
  onAddCategory: (name: string, icon: string) => void;
  onDeleteCategory: (id: number) => void;
}

export function Sidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  scripts,
  selectedScriptId,
  onSelectScript,
  search,
  onSearchChange,
  onAddScript,
  onImportScripts,
  onAddCategory,
  onDeleteCategory,
}: Props) {
  return (
    <div className="w-full h-full flex flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-bold">ScriptPad</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={onImportScripts}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
              title="导入脚本文件"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={onAddScript}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
              title="添加脚本"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索脚本..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-2 border-b border-border">
        <CategoryList
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={onSelectCategory}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
        />
      </div>

      {/* Script List */}
      <div className="flex-1 overflow-y-auto p-2">
        <ScriptList
          scripts={scripts}
          selectedId={selectedScriptId}
          onSelect={onSelectScript}
        />
      </div>
    </div>
  );
}
