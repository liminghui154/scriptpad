import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ScriptDetail } from '@/components/detail/ScriptDetail';
import { ScriptForm } from '@/components/detail/ScriptForm';
import { OutputPanel } from '@/components/output/OutputPanel';
import { HistoryList } from '@/components/output/HistoryList';
import { ResizeHandle } from '@/components/ResizeHandle';
import { useCategories } from '@/hooks/useCategories';
import { useScripts } from '@/hooks/useScripts';
import { useExecution } from '@/hooks/useExecution';
import type { CreateScript } from '@/lib/types';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { Terminal } from 'lucide-react';
import { open, ask } from '@tauri-apps/plugin-dialog';

function AppInner() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [detailWidth, setDetailWidth] = useState(360);

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth(w => Math.max(180, Math.min(400, w + delta)));
  }, []);
  const handleDetailResize = useCallback((delta: number) => {
    setDetailWidth(w => Math.max(280, Math.min(600, w + delta)));
  }, []);

  const { categories, selectedCategoryId, setSelectedCategoryId, addCategory, removeCategory } = useCategories();
  const { scripts, selectedScript, setSelectedScript, addScript, editScript, removeScript, refresh } =
    useScripts(selectedCategoryId, search);
  const { running, output, exitCode, duration, run, stop, clear } = useExecution();

  const handleSave = async (data: CreateScript) => {
    if (editMode && selectedScript) {
      await editScript(selectedScript.id, data);
    } else {
      await addScript(data);
    }
    setShowForm(false);
    setEditMode(false);
    refresh();
  };

  const handleDelete = async () => {
    if (!selectedScript) return;
    const confirmed = await ask('确定删除此脚本？', { title: '删除确认', kind: 'warning' });
    if (confirmed) {
      await removeScript(selectedScript.id);
    }
  };

  const handleImport = async () => {
    const files = await open({
      multiple: true,
      title: '选择脚本文件',
      filters: [
        {
          name: '脚本文件',
          extensions: ['sh', 'bash', 'zsh', 'py', 'js', 'ts', 'rb', 'pl', 'php', 'lua', 'ps1', 'bat', 'cmd'],
        },
        {
          name: '所有文件',
          extensions: ['*'],
        },
      ],
    });
    if (!files) return;

    const paths = Array.isArray(files) ? files : [files];
    for (const filePath of paths) {
      const fileName = filePath.split('/').pop()?.split('\\').pop() ?? filePath;
      const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
      const shellMap: Record<string, string> = {
        sh: '/bin/bash', bash: '/bin/bash', zsh: '/bin/zsh',
        py: '/usr/bin/env python3', js: '/usr/bin/env node', ts: '/usr/bin/env ts-node',
        rb: '/usr/bin/env ruby', pl: '/usr/bin/env perl', php: '/usr/bin/env php',
        lua: '/usr/bin/env lua', ps1: 'powershell', bat: 'cmd', cmd: 'cmd',
      };
      const shell = shellMap[ext] ?? '/bin/bash';
      const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
      const dir = filePath.substring(0, filePath.lastIndexOf('/')) || undefined;

      await addScript({
        name: nameWithoutExt,
        script_type: 'file',
        file_path: filePath,
        shell,
        working_dir: dir,
      });
    }
    refresh();
  };

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden bg-background text-foreground">
      <div style={{ width: sidebarWidth, flexShrink: 0 }}>
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          scripts={scripts}
          selectedScriptId={selectedScript?.id ?? null}
          onSelectScript={setSelectedScript}
          search={search}
          onSearchChange={setSearch}
          onAddScript={() => { setEditMode(false); setShowForm(true); }}
          onImportScripts={handleImport}
          onAddCategory={addCategory}
          onDeleteCategory={removeCategory}
        />
      </div>

      <ResizeHandle onResize={handleSidebarResize} />

      <div className="flex-1 flex min-w-0">
        {selectedScript ? (
          <>
            <div style={{ width: detailWidth, flexShrink: 0 }} className="border-r border-border overflow-y-auto">
              <ScriptDetail
                script={selectedScript}
                running={running}
                onRun={(params) => run(selectedScript.id, params)}
                onStop={stop}
                onEdit={() => { setEditMode(true); setShowForm(true); }}
                onDelete={handleDelete}
                onShowHistory={() => setShowHistory(true)}
              />
            </div>
            <ResizeHandle onResize={handleDetailResize} />
            <div className="flex-1 overflow-hidden min-w-0">
              <OutputPanel
                output={output}
                running={running}
                exitCode={exitCode}
                duration={duration}
                onClear={clear}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">选择一个脚本开始</p>
              <p className="text-xs mt-1">或点击左上角 + 添加新脚本</p>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ScriptForm
          script={editMode ? selectedScript : null}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditMode(false); }}
        />
      )}

      {showHistory && selectedScript && (
        <HistoryList
          scriptId={selectedScript.id}
          scriptName={selectedScript.name}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
