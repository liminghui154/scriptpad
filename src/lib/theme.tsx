import { createContext, useContext, useState } from 'react';

export type Theme = 'default' | 'cute' | 'journal' | 'mecha';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('scriptpad-theme') as Theme) ?? 'default';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('scriptpad-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
