import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { listHistory } from '@/lib/api';
import type { ExecutionHistory } from '@/lib/types';

interface Props {
  scriptId: number;
  scriptName: string;
  onClose: () => void;
}

export function HistoryList({ scriptId, scriptName, onClose }: Props) {
  const [history, setHistory] = useState<ExecutionHistory[]>([]);

  useEffect(() => {
    listHistory(scriptId).then(setHistory).catch(console.error);
  }, [scriptId]);

  const formatDate = (d: string) => {
    try {
      return new Date(d + 'Z').toLocaleString('zh-CN');
    } catch {
      return d;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[500px] max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            执行历史 - {scriptName}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">暂无执行记录</div>
          ) : (
            <div className="divide-y divide-border">
              {history.map(h => (
                <div key={h.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {h.exit_code === 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : h.exit_code !== null ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">
                        退出码: {h.exit_code ?? '运行中'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(h.duration_ms)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(h.started_at)}
                  </div>
                  {h.params && h.params !== '{}' && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      参数: {h.params}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
