import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('pharmacy_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  // If user OS prefers dark mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const initialTheme = getInitialTheme();

// Apply initial dark class immediately to document
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useTheme = create((set) => ({
  theme: initialTheme,
  isDark: initialTheme === 'dark',
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pharmacy_theme', nextTheme);
      }
      if (typeof document !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return {
        theme: nextTheme,
        isDark: nextTheme === 'dark',
      };
    });
  },
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pharmacy_theme', theme);
    }
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme, isDark: theme === 'dark' });
  },
}));

