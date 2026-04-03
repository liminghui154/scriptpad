import { useState, useEffect, useCallback, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { executeScript, stopExecution } from '@/lib/api';
import type { ScriptOutput, ExecutionComplete } from '@/lib/types';

interface OutputLine {
  stream: 'stdout' | 'stderr';
  data: string;
}

export function useExecution() {
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const unlistenRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      unlistenRef.current.forEach(fn => fn());
    };
  }, []);

  const run = useCallback(async (scriptId: number, params: Record<string, string>) => {
    // Clean up previous listeners
    unlistenRef.current.forEach(fn => fn());
    unlistenRef.current = [];

    setOutput([]);
    setExitCode(null);
    setDuration(null);
    setRunning(true);

    try {
      const eid = await executeScript(scriptId, params);
      setExecutionId(eid);

      const unlistenOutput = await listen<ScriptOutput>('script-output', (event) => {
        if (event.payload.execution_id === eid) {
          setOutput(prev => [...prev, {
            stream: event.payload.stream,
            data: event.payload.data,
          }]);
        }
      });

      const unlistenComplete = await listen<ExecutionComplete>('execution-complete', (event) => {
        if (event.payload.execution_id === eid) {
          setRunning(false);
          setExitCode(event.payload.exit_code);
          setDuration(event.payload.duration_ms);
        }
      });

      unlistenRef.current = [unlistenOutput, unlistenComplete];
    } catch (e) {
      setRunning(false);
      setOutput([{ stream: 'stderr', data: `Failed to start: ${e}` }]);
    }
  }, []);

  const stop = useCallback(async () => {
    if (executionId != null) {
      try {
        await stopExecution(executionId);
      } catch (e) {
        console.error('Failed to stop:', e);
      }
    }
  }, [executionId]);

  const clear = useCallback(() => {
    setOutput([]);
    setExitCode(null);
    setDuration(null);
  }, []);

  return { running, output, exitCode, duration, run, stop, clear };
}
