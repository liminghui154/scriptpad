import { useState, useEffect, useCallback } from 'react';
import { listScripts, createScript, updateScript, deleteScript } from '@/lib/api';
import type { Script } from '@/lib/types';
import type { CreateScript, UpdateScript } from '@/lib/types';

export function useScripts(categoryId: number, search: string) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listScripts(categoryId || undefined, search || undefined);
      setScripts(list);
    } catch (e) {
      console.error('Failed to load scripts:', e);
    } finally {
      setLoading(false);
    }
  }, [categoryId, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addScript = useCallback(async (script: CreateScript) => {
    const created = await createScript(script as any);
    setScripts(prev => [created, ...prev]);
    setSelectedScript(created);
    return created;
  }, []);

  const editScript = useCallback(async (id: number, data: UpdateScript) => {
    const updated = await updateScript(id, data as any);
    setScripts(prev => prev.map(s => s.id === id ? updated : s));
    setSelectedScript(prev => prev?.id === id ? updated : prev);
    return updated;
  }, []);

  const removeScript = useCallback(async (id: number) => {
    await deleteScript(id);
    setScripts(prev => prev.filter(s => s.id !== id));
    setSelectedScript(prev => prev?.id === id ? null : prev);
  }, []);

  return { scripts, selectedScript, setSelectedScript, loading, addScript, editScript, removeScript, refresh };
}
