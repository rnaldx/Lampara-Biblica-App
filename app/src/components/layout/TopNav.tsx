import React, { useState, useEffect } from 'react';
import { Menu, Search, Settings as SettingsIcon, Bell, Moon, Sun, Type, ChevronRight, X, ChevronDown } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface TopNavProps {
    title?: string;
    onMenuClick?: () => void;
    onTitleClick?: () => void;
    onSearch?: () => void;
    showSettings?: boolean;
}

const FontSizeMenu = ({ onClose }: { onClose: () => void }) => {
    const sizes = [14, 16, 18, 20, 24];
    const currentSize = parseInt(localStorage.getItem('lampara_font_size') || '18');

    const setSize = (s: number) => {
        localStorage.setItem('lampara_font_size', s.toString());
        window.dispatchEvent(new Event('font-size-change'));
        onClose();
    };

    return (
        <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#1c2127] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 animate-in fade-in zoom-in duration-200 origin-top-right">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tamaño del Texto</p>
            {sizes.map(s => (
                <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        currentSize === s 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <span style={{ fontSize: `${s}px` }}>Aa</span>
                    <span className="text-xs opacity-60">{s}px</span>
                </button>
            ))}
        </div>
    );
};

const SearchOverlay = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-background-dark animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <button onClick={onClose} className="p-2 text-slate-400">
                    <X size={24} />
                </button>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Buscar pasajes, temas o notas..." 
                        className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl py-3 pl-10 pr-4 outline-none border-2 border-transparent focus:border-primary/20 transition-all text-sm"
                    />
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sugerencias</h3>
                <div className="flex flex-wrap gap-2">
                    {['Salmos', 'Jesús', 'Amor', 'Gálatas 5:22', 'Sabiduría', 'Fe'].map(tag => (
                        <button key={tag} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TopNav: React.FC<TopNavProps> = ({ 
    title = 'Mateo 5', 
    onMenuClick, 
    onTitleClick, 
    onSearch,
    showSettings = false
}) => {
    const { isDark, toggleTheme } = useDarkMode();
    const [scrolled, setScrolled] = useState(false);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled 
                    ? 'h-24 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800' 
                    : 'h-28 bg-transparent'
                }`}
            >
                {/* Status Bar Decorator (iOS Style) */}
                <div className="h-10 w-full" />

                <div className="flex items-center justify-between px-5 h-14 max-w-lg mx-auto">
                    {/* Left: Menu/Back */}
                    <button 
                        onClick={onMenuClick}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-[#1c2127] shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 active:scale-90 transition-all"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Center: Title / Context */}
                    <button 
                        onClick={onTitleClick}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95 group"
                    >
                        <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {title}
                        </span>
                        {!showSettings && (
                            <div className="bg-primary/10 group-hover:bg-primary/20 p-0.5 rounded-md text-primary transition-colors">
                                <ChevronDown size={14} strokeWidth={3} />
                            </div>
                        )}
                    </button>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => { setShowSearch(true); onSearch?.(); }}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-primary transition-colors active:scale-90"
                        >
                            <Search size={22} />
                        </button>

                        <div className="relative">
                            <button 
                                onClick={() => setShowFontMenu(!showFontMenu)}
                                className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-colors active:scale-90 ${
                                    showFontMenu ? 'bg-primary/10 text-primary' : 'text-slate-400'
                                }`}
                            >
                                <Type size={22} />
                            </button>
                            {showFontMenu && <FontSizeMenu onClose={() => setShowFontMenu(false)} />}
                        </div>

                        <button 
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#f8fafc] dark:bg-[#161b22] text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all active:scale-90"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Overlays */}
            {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
            
            {/* Click outside to close font menu */}
            {showFontMenu && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowFontMenu(false)} 
                />
            )}
        </>
    );
};

export default TopNav;
