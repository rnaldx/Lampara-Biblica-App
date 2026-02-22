import { useState, useEffect } from 'react';

export function useDarkMode() {
    // Determine machine/system preference or stored preference
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('lampara_theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('lampara_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('lampara_theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    return { isDark, toggleTheme };
}
