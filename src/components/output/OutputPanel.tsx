import { useEffect, useRef } from 'react';
import { Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface OutputLine {
  stream: 'stdout' | 'stderr';
  data: string;
}

interface Props {
  output: OutputLine[];
  running: boolean;
  exitCode: number | null;
  duration: number | null;
  onClear: () => void;
}

export function OutputPanel({ output, running, exitCode, duration, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">输出</h3>
          {running && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <Loader2 className="w-3 h-3 animate-spin" /> 运行中...
            </span>
          )}
          {!running && exitCode !== null && (
            <span className="flex items-center gap-1 text-xs">
              {exitCode === 0 ? (
                <><CheckCircle className="w-3 h-3 text-green-500" /> 成功</>
              ) : (
                <><XCircle className="w-3 h-3 text-destructive" /> 退出码: {exitCode}</>
              )}
              {duration !== null && (
                <span className="text-muted-foreground ml-2">
                  {duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`}
                </span>
              )}
            </span>
          )}
        </div>
        <button onClick={onClear} className="p-1 rounded hover:bg-accent" title="清空">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-5">
        {output.length === 0 && !running && (
          <div className="text-muted-foreground text-center py-8">
            运行脚本后输出将显示在这里
          </div>
        )}
        {output.map((line, i) => (
          <div
            key={i}
            className={line.stream === 'stderr' ? 'text-destructive' : 'text-foreground'}
          >
            {line.data}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
