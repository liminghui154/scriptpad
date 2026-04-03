import { useState, useEffect } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import type { ParamSchema, ParamPreset } from '@/lib/types';
import { listPresets, savePreset, deletePreset } from '@/lib/api';

interface Props {
  schema: ParamSchema[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  scriptId: number;
}

export function ParamForm({ schema, values, onChange, scriptId }: Props) {
  const [presets, setPresets] = useState<ParamPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    listPresets(scriptId).then(setPresets).catch(console.error);
  }, [scriptId]);

  // Initialize defaults
  useEffect(() => {
    const defaults: Record<string, string> = {};
    schema.forEach(p => {
      if (p.default && !values[p.name]) {
        defaults[p.name] = p.default;
      }
    });
    if (Object.keys(defaults).length > 0) {
      onChange({ ...values, ...defaults });
    }
  }, [schema]);

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    try {
      const preset = await savePreset(scriptId, presetName, values);
      setPresets(prev => [preset, ...prev]);
      setPresetName('');
    } catch (e) {
      console.error('Failed to save preset:', e);
    }
  };

  const handleLoadPreset = (preset: ParamPreset) => {
    try {
      const params = JSON.parse(preset.params);
      onChange(params);
      setShowPresets(false);
    } catch {}
  };

  const handleDeletePreset = async (id: number) => {
    await deletePreset(id);
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase">参数</h3>
        {presets.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              预设 <ChevronDown className="w-3 h-3" />
            </button>
            {showPresets && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-10">
                {presets.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-accent">
                    <button onClick={() => handleLoadPreset(p)} className="text-sm flex-1 text-left">
                      {p.name}
                    </button>
                    <button onClick={() => handleDeletePreset(p.id)} className="text-xs text-destructive ml-2">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {schema.map(param => (
          <div key={param.name}>
            <label className="block text-sm mb-1">
              {param.label || param.name}
              {param.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              type="text"
              value={values[param.name] || ''}
              onChange={e => onChange({ ...values, [param.name]: e.target.value })}
              placeholder={param.default || ''}
              className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        ))}
      </div>

      {/* Save as preset */}
      <div className="flex items-center gap-2 mt-3">
        <input
          type="text"
          value={presetName}
          onChange={e => setPresetName(e.target.value)}
          placeholder="预设名称..."
          className="flex-1 px-3 py-1.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleSavePreset}
          disabled={!presetName.trim()}
          className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50"
          title="保存预设"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
