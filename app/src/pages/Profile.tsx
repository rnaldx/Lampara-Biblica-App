import React, { useRef, useState, useEffect } from 'react';
import { Camera, Flame, FileText, Edit3, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import TopNav from '../components/layout/TopNav';
import { getReadingLog } from '../services/readingTracker';

interface Note {
    id: string;
    text: string;
    book?: string;
    chapter?: number;
    verse?: number;
    createdAt: string;
    tags?: string[];
}



const Profile: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarSrc, setAvatarSrc] = useState<string>(
        localStorage.getItem('lampara_avatar') ||
        'https://ui-avatars.com/api/?name=Mi+Perfil&background=1173d4&color=fff&size=150'
    );
    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('lampara_notes');
        if (saved) { try { setNotes(JSON.parse(saved)); } catch { /* ignore */ } }
    }, []);

    // Build exactly 12 weeks of data ending today, starting on Sunday
    const buildHeatmap = () => {
        const today = new Date();
        const totalWeeks = 12;
        // Find the start: go back 12 weeks from the nearest past Sunday
        const dayOfWeek = today.getDay(); // 0=Sun
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek - (totalWeeks - 1) * 7);

        const readingLog = getReadingLog();
        const weeks: { date: string; displayDate: string; level: 0 | 1 | 2 | 3; monthLabel?: string }[][] = [];
        const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        for (let w = 0; w < totalWeeks; w++) {
            const week: { date: string; displayDate: string; level: 0 | 1 | 2 | 3; monthLabel?: string }[] = [];
            for (let d = 0; d < 7; d++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + w * 7 + d);
                const dateStr = cellDate.toISOString().slice(0, 10);

                const noteCount = notes.filter(n => n.createdAt.slice(0, 10) === dateStr).length;
                const readingCount = readingLog.filter(e => e.date === dateStr).length;
                const totalActivity = noteCount + readingCount;

                const level = totalActivity === 0 ? 0 : totalActivity === 1 ? 1 : totalActivity <= 3 ? 2 : 3;

                // Show month label on first day (Sunday) of the week when month changes
                let monthLabel: string | undefined;
                if (d === 0 && (w === 0 || cellDate.getDate() <= 7)) {
                    monthLabel = MONTHS_ES[cellDate.getMonth()];
                }
                week.push({ date: dateStr, displayDate: cellDate.toLocaleDateString('es', { day: 'numeric', month: 'short' }), level: level as 0 | 1 | 2 | 3, monthLabel });
            }
            weeks.push(week);
        }
        return weeks;
    };

    const heatmapWeeks = buildHeatmap();
    const activeDays = heatmapWeeks.flat().filter(c => c.level > 0).length;
    const totalDays = heatmapWeeks.flat().length;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setAvatarSrc(result);
            localStorage.setItem('lampara_avatar', result);
        };
        reader.readAsDataURL(file);
    };

    const realNoteCount = notes.length;
    const streak = (() => {
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const has = notes.some(n => n.createdAt.slice(0, 10) === dateStr);
            if (has) count++;
            else if (i > 0) break;
        }
        return count;
    })();

    const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Hace ${mins} min`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `Hace ${hrs} h`;
        const days = Math.floor(hrs / 24);
        return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    };

    return (
        <>
            <TopNav title="Perfil" showSettings={true} />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
            />

            <main className="flex-1 flex flex-col gap-5 overflow-y-auto pb-24 pt-20 px-4">
                {/* Avatar / Identity */}
                <section className="flex flex-col items-center pt-2">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#1c2127] shadow-xl">
                            <img alt="Avatar" className="w-full h-full object-cover" src={avatarSrc} />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-white dark:border-background-dark shadow-md hover:bg-blue-600 active:scale-95 transition-all"
                        >
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Perfil</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Buscando sabiduría cada día</p>

                        <div className="flex gap-2 justify-center mt-3">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">Miembro Pro</span>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">Adoptante Temprano</span>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-[#1c2127] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-1">
                                <Flame className="text-orange-500" size={24} />
                            </div>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{streak}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Racha de días</span>
                        </div>

                        <div className="bg-white dark:bg-[#1c2127] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-1">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-1">
                                <FileText className="text-primary" size={24} />
                            </div>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{realNoteCount}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Total de notas</span>
                        </div>
                    </div>
                </section>

                {/* Habit Heatmap — full redesign */}
                <section>
                    <div className="bg-white dark:bg-[#1c2127] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 pt-4 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Constancia de Estudio</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {activeDays} día{activeDays !== 1 ? 's' : ''} activo{activeDays !== 1 ? 's' : ''} de {totalDays}
                                    </p>
                                </div>
                                {/* Legend */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-400">Menos</span>
                                    {([0, 1, 2, 3] as const).map(l => (
                                        <div key={l} className={`w-3.5 h-3.5 rounded-[3px] ${['bg-slate-200 dark:bg-slate-700/60', 'bg-primary/30', 'bg-primary/60', 'bg-primary'][l]
                                            }`} />
                                    ))}
                                    <span className="text-[10px] text-slate-400">Más</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="px-4 pb-4">
                            {/* Month labels row */}
                            <div className="flex mb-1 ml-5">
                                {heatmapWeeks.map((week, wi) => (
                                    <div key={wi} className="flex-1 text-[9px] text-slate-400 font-medium text-center">
                                        {week[0].monthLabel || ''}
                                    </div>
                                ))}
                            </div>

                            {/* Main grid: 7 rows (days) × 12 cols (weeks) */}
                            <div className="flex gap-x-1">
                                {/* Day-of-week labels */}
                                <div className="flex flex-col justify-between shrink-0 pr-1" style={{ width: '18px' }}>
                                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => (
                                        // Only show alternate labels to save space
                                        <div key={d} className="flex items-center" style={{ height: '100%', minHeight: '14px' }}>
                                            {i % 2 === 1 && (
                                                <span className="text-[9px] text-slate-400 leading-none">{d}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Week columns */}
                                <div className="flex flex-1 gap-x-1">
                                    {heatmapWeeks.map((week, wi) => (
                                        <div key={wi} className="flex-1 flex flex-col gap-y-1">
                                            {week.map((cell, di) => (
                                                <div
                                                    key={di}
                                                    title={`${cell.displayDate}${cell.level > 0 ? ' — ' + cell.level + ' nota(s)' : ''}`}
                                                    className={`w-full rounded-[3px] ${['bg-slate-200 dark:bg-slate-700/60', 'bg-primary/30', 'bg-primary/60', 'bg-primary'][cell.level]
                                                        }`}
                                                    style={{ aspectRatio: '1' }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer stats bar */}
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-around">
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{streak}</p>
                                <p className="text-[10px] text-slate-400">Racha actual</p>
                            </div>
                            <div className="w-px bg-slate-200 dark:bg-slate-700" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{activeDays}</p>
                                <p className="text-[10px] text-slate-400">Días con notas</p>
                            </div>
                            <div className="w-px bg-slate-200 dark:bg-slate-700" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                    {totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0}%
                                </p>
                                <p className="text-[10px] text-slate-400">Consistencia</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 px-1">Actividad Reciente</h3>
                    <div className="flex flex-col gap-3">
                        {recentNotes.length > 0 ? recentNotes.map(note => (
                            <div key={note.id} className="bg-white dark:bg-[#1c2127] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <Edit3 className="text-primary" size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-slate-900 dark:text-white font-medium text-sm truncate">
                                        {note.book ? `${note.book} ${note.chapter}${note.verse ? ':' + note.verse : ''}` : 'Nota general'}
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">
                                        {note.text.slice(0, 80)}…
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2 font-medium">{timeAgo(note.createdAt)}</p>
                                </div>
                            </div>
                        )) : (
                            <>
                                {/* Placeholder items when no real notes exist */}
                                <div className="bg-white dark:bg-[#1c2127] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <BookOpen className="text-primary" size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-slate-900 dark:text-white font-medium text-sm">Comenzaste a leer</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Génesis 1 — Al principio…</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2 font-medium">Hoy</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1c2127] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                        <Sparkles className="text-purple-500" size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-slate-900 dark:text-white font-medium text-sm">Análisis IA de "Gracia"</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Contexto original en griego</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2 font-medium">Ayer</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1c2127] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="text-emerald-500" size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-slate-900 dark:text-white font-medium text-sm">Plan Completado</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Salmos de Consuelo — Día 7 de 7</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2 font-medium">Hace 3 días</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
};

export default Profile;
