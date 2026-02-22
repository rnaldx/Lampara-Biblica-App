import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, StickyNote, Calendar, User, Heart } from 'lucide-react';

const MainLayout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Lector', icon: BookOpen },
        { path: '/notes', label: 'Notas', icon: StickyNote },
        { path: '/calendar', label: 'Estudio', icon: Calendar },
        { path: '/profile', label: 'Perfil', icon: User },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen flex flex-col relative overflow-hidden font-sans">
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <Outlet />
            </div>

            {/* Bottom Navigation Bar */}
            <nav className="shrink-0 w-full z-[100] bg-white/80 dark:bg-[#1c2127]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-safe-area shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex justify-around items-center px-2 py-3 max-w-lg mx-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-2xl transition-all duration-300 ${
                                    isActive 
                                    ? 'text-primary scale-110' 
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            >
                                <div className={`relative ${isActive ? 'after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full' : ''}`}>
                                    <Icon 
                                        size={24} 
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? 'drop-shadow-[0_0_8px_rgba(17,115,212,0.4)]' : ''} 
                                    />
                                </div>
                                <span className={`text-[10px] font-bold tracking-tight uppercase ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Floating Action Hint (opcional) */}
            {/* <div className="fixed bottom-24 right-6 pointer-events-none">
                <div className="bg-primary text-white p-4 rounded-full shadow-2xl animate-bounce">
                    <Heart size={24} fill="currentColor" />
                </div>
            </div> */}

            {/* Support for mobile safe areas */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-[#1c2127]" />
        </div>
    );
};

export default MainLayout;
