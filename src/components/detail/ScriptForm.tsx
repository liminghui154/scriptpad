import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Script, Category, CreateScript, ParamSchema } from '@/lib/types';

interface Props {
  script?: Script | null;
  categories: Category[];
  onSave: (data: CreateScript) => void;
  onClose: () => void;
}

export function ScriptForm({ script, categories, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scriptType, setScriptType] = useState<'file' | 'inline'>('inline');
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');
  const [shell, setShell] = useState('/bin/bash');
  const [workingDir, setWorkingDir] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tags, setTags] = useState('');
  const [params, setParams] = useState<ParamSchema[]>([]);

  useEffect(() => {
    if (script) {
      setName(script.name);
      setDescription(script.description);
      setScriptType(script.script_type);
      setFilePath(script.file_path || '');
      setContent(script.content || '');
      setShell(script.shell);
      setWorkingDir(script.working_dir || '');
      setCategoryId(script.category_id || undefined);
      try { setTags(JSON.parse(script.tags).join(', ')); } catch { setTags(''); }
      try { setParams(JSON.parse(script.params_schema)); } catch { setParams([]); }
    }
  }, [script]);

  const addParam = () => {
    setParams([...params, { name: '', label: '', default: '', required: false }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: keyof ParamSchema, value: string | boolean) => {
    setParams(params.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      name,
      description,
      script_type: scriptType,
      file_path: scriptType === 'file' ? filePath : undefined,
      content: scriptType === 'inline' ? content : undefined,
      shell,
      working_dir: workingDir || undefined,
      category_id: categoryId,
      tags: JSON.stringify(tagsArray),
      params_schema: JSON.stringify(params.filter(p => p.name)),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[560px] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold">{script ? '编辑脚本' : '添加脚本'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1">名称 <span className="text-destructive">*</span></label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">描述</label>
            <input
              type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Type + Shell */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">类型</label>
              <select
                value={scriptType} onChange={e => setScriptType(e.target.value as 'file' | 'inline')}
                className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="inline">内联脚本</option>
                <option value="file">脚本文件</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Shell</label>
              <select
                value={shell} onChange={e => setShell(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="/bin/bash">Bash</option>
                <option value="/bin/zsh">Zsh</option>
                <option value="/bin/sh">Sh</option>
                <option value="/usr/bin/env python3">Python</option>
                <option value="/usr/bin/env node">Node.js</option>
              </select>
            </div>
          </div>

          {/* File path or content */}
          {scriptType === 'file' ? (
            <div>
              <label className="block text-sm mb-1">文件路径</label>
              <input
                type="text" value={filePath} onChange={e => setFilePath(e.target.value)}
                placeholder="/path/to/script.sh"
                className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm mb-1">脚本内容</label>
              <textarea
                value={content} onChange={e => setContent(e.target.value)}
                rows={6}
                placeholder="echo 'Hello World'"
                className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono resize-y"
              />
            </div>
          )}

          {/* Working dir */}
          <div>
            <label className="block text-sm mb-1">工作目录</label>
            <input
              type="text" value={workingDir} onChange={e => setWorkingDir(e.target.value)}
              placeholder="留空使用默认目录"
              className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
          </div>

          {/* Category + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">分类</label>
              <select
                value={categoryId || ''} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">无分类</option>
                {categories.filter(c => c.id !== 1).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">标签</label>
              <input
                type="text" value={tags} onChange={e => setTags(e.target.value)}
                placeholder="逗号分隔"
                className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Params */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm">参数定义</label>
              <button type="button" onClick={addParam} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                <Plus className="w-3 h-3" /> 添加参数
              </button>
            </div>
            {params.map((param, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text" value={param.name} onChange={e => updateParam(i, 'name', e.target.value)}
                  placeholder="变量名" className="flex-1 px-2 py-1 text-xs bg-background border border-input rounded-md font-mono"
                />
                <input
                  type="text" value={param.label} onChange={e => updateParam(i, 'label', e.target.value)}
                  placeholder="显示名" className="flex-1 px-2 py-1 text-xs bg-background border border-input rounded-md"
                />
                <input
                  type="text" value={param.default} onChange={e => updateParam(i, 'default', e.target.value)}
                  placeholder="默认值" className="w-20 px-2 py-1 text-xs bg-background border border-input rounded-md"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={param.required} onChange={e => updateParam(i, 'required', e.target.checked)} />
                  必填
                </label>
                <button type="button" onClick={() => removeParam(i)} className="p-1 text-destructive hover:bg-accent rounded">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md hover:bg-accent">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              {script ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
