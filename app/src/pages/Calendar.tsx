import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Clock, X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Note {
    id: string;
    text: string;
    book?: string;
    chapter?: number;
    verse?: number;
    createdAt: string; // ISO string
    tags?: string[];
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Calendar: React.FC = () => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10));
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('lampara_notes');
        if (saved) {
            try {
                setNotes(JSON.parse(saved));
            } catch { /* ignore */ }
        }
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const noteDatesSet = new Set(
        notes.map(n => n.createdAt.slice(0, 10))
    );

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const selectedNotes = notes.filter(n => {
        const matchesDate = n.createdAt.slice(0, 10) === selectedDate;
        const matchesSearch = !searchTerm ||
            n.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.tags && n.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (n.book && n.book.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    const formatTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const truncate = (text: string, max: number) => text.length > max ? text.slice(0, max) + '…' : text;

    return (
        <div className="h-full overflow-y-auto bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-14 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                        <ChevronLeft size={22} />
                    </button>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </h2>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                        <ChevronRight size={22} />
                    </button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 mt-3 max-w-lg mx-auto">
                    {DAYS_OF_WEEK.map(d => (
                        <div key={d} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1">{d}</div>
                    ))}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-4 pt-2 max-w-lg mx-auto">
                <div className="grid grid-cols-7">
                    {cells.map((day, idx) => {
                        if (day === null) return <div key={`e-${idx}`} />;
                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isToday = dateStr === today.toISOString().slice(0, 10);
                        const isSelected = dateStr === selectedDate;
                        const hasNote = noteDatesSet.has(dateStr);
                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`relative flex flex-col items-center py-2 rounded-xl mx-0.5 my-0.5 transition-all ${isSelected
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : isToday
                                        ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                <span className="text-sm font-medium">{day}</span>
                                {hasNote && (
                                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white/80' : 'bg-primary'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notes for selected day */}
            <div className="px-4 pt-4 pb-32 max-w-lg mx-auto">
                <div className="mb-4">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar en notas (texto, hashtag, libro)..."
                            className="w-full bg-white dark:bg-[#1c2127] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        {selectedDate === today.toISOString().slice(0, 10) ? 'Hoy' : new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <span className="text-xs text-slate-400">{selectedNotes.length} nota{selectedNotes.length !== 1 ? 's' : ''}</span>
                </div>

                {selectedNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                            <BookOpen size={26} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No hay notas para este día</p>
                        <Link to="/notes" state={{ text: '', book: '', chapter: 1 }}
                            className="mt-3 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">
                            Crear nota
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedNotes.map(note => (
                            <div key={note.id} className="bg-white dark:bg-[#1c2127] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    {note.book && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            <BookOpen size={11} />
                                            {note.book} {note.chapter}{note.verse ? `:${note.verse}` : ''}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">
                                        <Clock size={11} />
                                        {formatTime(note.createdAt)}
                                    </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                    {truncate(note.text, 120)}
                                </p>
                                {note.tags && note.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {note.tags.slice(0, 4).map(tag => (
                                            <span key={tag} className="text-[11px] text-primary font-medium">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
