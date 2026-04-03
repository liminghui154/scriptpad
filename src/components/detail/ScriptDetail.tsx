import { useState, useEffect } from 'react';
import { Play, Square, Pencil, Trash2, Clock, ZoomIn, ZoomOut } from 'lucide-react';
import type { Script, ParamSchema } from '@/lib/types';
import { readFileContent } from '@/lib/api';
import { ParamForm } from './ParamForm';

interface Props {
  script: Script;
  running: boolean;
  onRun: (params: Record<string, string>) => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShowHistory: () => void;
}

export function ScriptDetail({ script, running, onRun, onStop, onEdit, onDelete, onShowHistory }: Props) {
  const [params, setParams] = useState<Record<string, string>>({});
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(12);
  const paramsSchema: ParamSchema[] = (() => {
    try { return JSON.parse(script.params_schema); } catch { return []; }
  })();
  const tags: string[] = (() => {
    try { return JSON.parse(script.tags); } catch { return []; }
  })();

  useEffect(() => {
    if (script.script_type === 'file' && script.file_path) {
      readFileContent(script.file_path)
        .then(setFileContent)
        .catch(() => setFileContent(null));
    } else {
      setFileContent(null);
    }
  }, [script.id, script.file_path, script.script_type]);

  const handleRun = () => {
    onRun(params);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{script.name}</h2>
            {script.description && (
              <p className="text-sm text-muted-foreground mt-1">{script.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onShowHistory} className="p-2 rounded-md hover:bg-accent" title="执行历史">
              <Clock className="w-4 h-4" />
            </button>
            <button onClick={onEdit} className="p-2 rounded-md hover:bg-accent" title="编辑">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 rounded-md hover:bg-accent text-destructive" title="删除">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
            {script.script_type === 'file' ? '文件' : '内联'}
          </span>
          <span className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
            {script.shell}
          </span>
          {script.file_path && (
            <span className="px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground font-mono">
              {script.file_path}
            </span>
          )}
          {tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Inline content preview */}
      {script.script_type === 'inline' && script.content && (
        <div className="px-4 pt-3 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">脚本内容</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(s => Math.max(10, s - 2))} className="p-0.5 rounded hover:bg-accent" title="缩小字体">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground w-8 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-0.5 rounded hover:bg-accent" title="放大字体">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <pre style={{ fontSize }} className="p-3 bg-background rounded-md border border-border overflow-auto flex-1 font-mono whitespace-pre">
            {script.content}
          </pre>
        </div>
      )}

      {/* File content preview */}
      {script.script_type === 'file' && fileContent !== null && (
        <div className="px-4 pt-3 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">文件内容</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(s => Math.max(10, s - 2))} className="p-0.5 rounded hover:bg-accent" title="缩小字体">
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground w-8 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-0.5 rounded hover:bg-accent" title="放大字体">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <pre style={{ fontSize }} className="p-3 bg-background rounded-md border border-border overflow-auto flex-1 font-mono whitespace-pre">
            {fileContent}
          </pre>
        </div>
      )}

      {/* Params */}
      {paramsSchema.length > 0 && (
        <div className="px-4 pt-3">
          <ParamForm
            schema={paramsSchema}
            values={params}
            onChange={setParams}
            scriptId={script.id}
          />
        </div>
      )}

      {/* Run button */}
      <div className="px-4 py-3 mt-auto border-t border-border">
        {running ? (
          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            <Square className="w-4 h-4" />
            停止执行
          </button>
        ) : (
          <button
            onClick={handleRun}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            运行脚本
          </button>
        )}
      </div>
    </div>
  );
}
