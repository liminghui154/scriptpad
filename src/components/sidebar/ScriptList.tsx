import { cn } from '@/lib/utils';
import type { Script } from '@/lib/types';
import { FileText, Terminal } from 'lucide-react';

interface Props {
  scripts: Script[];
  selectedId: number | null;
  onSelect: (script: Script) => void;
}

export function ScriptList({ scripts, selectedId, onSelect }: Props) {
  if (scripts.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
        暂无脚本
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {scripts.map(script => (
        <button
          key={script.id}
          onClick={() => onSelect(script)}
          className={cn(
            'w-full flex items-start gap-2 px-3 py-2 text-left rounded-md transition-colors',
            selectedId === script.id
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-accent'
          )}
        >
          {script.script_type === 'file' ? (
            <FileText className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <Terminal className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{script.name}</div>
            {script.description && (
              <div className="text-xs text-muted-foreground truncate">{script.description}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
