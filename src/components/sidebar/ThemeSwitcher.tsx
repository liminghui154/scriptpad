import { useTheme, type Theme } from '@/lib/theme';

const themes: { id: Theme; label: string; bg: string; accent: string }[] = [
  { id: 'default', label: '深色', bg: '#0a0a0a', accent: '#3b82f6' },
  { id: 'cute',    label: '可爱', bg: '#fdf4f8', accent: '#e879a0' },
  { id: 'journal', label: '手帐', bg: '#faf6ee', accent: '#8b5e3c' },
  { id: 'mecha',   label: '机甲', bg: '#050c14', accent: '#00d4ff' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-3 py-2 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">主题风格</p>
      <div className="flex gap-2">
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className="flex flex-col items-center gap-1 group"
          >
            {/* 色块预览 */}
            <span
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)`,
                borderColor: theme === t.id ? t.accent : 'transparent',
                boxShadow: theme === t.id ? `0 0 0 2px ${t.accent}40` : 'none',
              }}
            />
            <span
              className="text-[10px] transition-colors"
              style={{ color: theme === t.id ? t.accent : undefined }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
