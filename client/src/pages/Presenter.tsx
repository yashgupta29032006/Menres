import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState, type SlideType } from '../types';
import { motion } from 'framer-motion';
import {
    FaPlus, FaTrash, FaChartBar, FaFont, FaCloud, FaBold, FaItalic, FaUnderline,
    FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage, FaPlay, FaMagic
} from 'react-icons/fa';

/**
 * MENRES V3: DEEP ELEVATION
 * Philosophy: Content floats on a Slate-50 sea.
 * Separation: Padding & Shadows. NO Borders.
 */

const Presenter = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

    useEffect(() => {
        socket.on('state_update', (s) => setState(s));
        return () => {
            socket.off('state_update');
        };
    }, []);

    const addSlide = (type: SlideType = 'text') => {
        socket.emit('admin_control', {
            action: 'add_slide',
            value: { type, question: 'Untitled Slide', options: type === 'poll' ? { 'Option 1': 0, 'Option 2': 0 } : {} }
        });
    };

    const setSlide = (index: number) => {
        socket.emit('admin_control', { action: 'set_slide', value: index });
    };

    const deleteSlide = (index: number) => {
        if (confirm('Delete this slide?')) socket.emit('admin_control', { action: 'delete_slide', value: index });
    };

    return (
        <div className="h-screen w-full bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 overflow-hidden flex flex-col">

            {/* 1. FLOATING HEADER */}
            <header className="h-20 px-8 flex items-center justify-between shrink-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white shadow-soft rounded-xl flex items-center justify-center text-blue-600 font-black text-lg tracking-tighter">
                        M
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 tracking-tight">Q3 All-Hands</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 pr-2 rounded-full shadow-soft">
                    <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">
                        <FaMagic size={12} />
                    </button>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <button className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-full hover:bg-slate-900 shadow-lg shadow-slate-800/20 transition-all flex items-center gap-2">
                        <FaPlay size={8} /> Present
                    </button>
                </div>
            </header>

            {/* 2. MAIN WORKSPACE */}
            <div className="flex-1 flex overflow-hidden pb-6 px-6 gap-6">

                {/* LEFT: SLIDE STRIP */}
                <div className="w-60 flex flex-col gap-4">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 py-2 pl-2">
                        {state.slides.map((slide, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <span className="w-4 pt-4 text-[10px] font-bold text-slate-300 text-right">{idx + 1}</span>
                                <div
                                    onClick={() => setSlide(idx)}
                                    className={`relative w-full aspect-[4/3] rounded-2xl cursor-pointer transition-all duration-300 ${idx === state.currentSlideIndex
                                        ? 'bg-white shadow-xl scale-105 z-10 ring-0'
                                        : 'bg-white/40 hover:bg-white hover:shadow-lg hover:scale-105'
                                        }`}
                                >
                                    {/* Mini Preview */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                        {slide.type === 'poll' && <FaChartBar size={20} className="text-slate-800" />}
                                        {slide.type === 'text' && <FaFont size={20} className="text-slate-800" />}
                                        {slide.type === 'wordcloud' && <FaCloud size={20} className="text-slate-800" />}
                                    </div>

                                    {/* Active Indicator */}
                                    {idx === state.currentSlideIndex && (
                                        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full shadow-glow"></div>
                                    )}

                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSlide(idx) }}
                                        className="absolute -left-2 -top-2 w-6 h-6 bg-white shadow-md rounded-full text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-20"
                                    >
                                        <FaTrash size={8} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => addSlide('text')}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <FaPlus /> New Slide
                    </button>
                </div>

                {/* CENTER: THE CANVAS */}
                <div className="flex-1 relative flex flex-col items-center justify-center perspective-1000">

                    {/* FLOATING TOOLBAR PILL */}
                    <div className="absolute top-0 z-50 bg-white/90 backdrop-blur-md px-2 py-2 rounded-full shadow-floating border border-white/20 flex items-center gap-1 transition-transform hover:scale-105">
                        <ToolbarIcon icon={<FaBold />} />
                        <ToolbarIcon icon={<FaItalic />} />
                        <ToolbarIcon icon={<FaUnderline />} />
                        <div className="w-px h-4 bg-slate-200 mx-2"></div>
                        <ToolbarIcon icon={<FaAlignLeft />} />
                        <ToolbarIcon icon={<FaAlignCenter />} active />
                        <ToolbarIcon icon={<FaAlignRight />} />
                        <div className="w-px h-4 bg-slate-200 mx-2"></div>
                        <ToolbarIcon icon={<FaImage />} />
                    </div>

                    {/* THE SLIDE CARD */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full max-w-4xl aspect-[16/9] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative"
                    >
                        <div className="flex-1 p-20 flex flex-col items-center">
                            <input
                                value={state.currentSlide.question}
                                onChange={() => { }}
                                placeholder="Type your question..."
                                className="w-full text-center text-5xl font-black text-slate-800 bg-transparent placeholder:text-slate-200 focus:placeholder:text-slate-100 outline-none pb-8"
                            />

                            <div className="flex-1 w-full flex items-center justify-center">
                                <SlideVisualization slide={state.currentSlide} pollCounts={state.pollCounts} />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="h-16 px-10 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-400">Live Presentation</span>
                            </div>
                            <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">menti.clone</span>
                        </div>
                    </motion.div>

                </div>

                {/* RIGHT: CONFIG PANEL */}
                <div className="w-80 bg-white rounded-3xl shadow-soft p-6 flex flex-col gap-6 overflow-hidden">

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <TabButton label="Content" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                        <TabButton label="Design" active={activeTab === 'design'} onClick={() => setActiveTab('design')} />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                        {activeTab === 'content' ? (
                            <>
                                <section>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Slide Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <TypeSelect
                                            icon={<FaChartBar />}
                                            label="Poll"
                                            active={state.currentSlide.type === 'poll'}
                                            onClick={() => addSlide('poll')}
                                        />
                                        <TypeSelect
                                            icon={<FaCloud />}
                                            label="Cloud"
                                            active={state.currentSlide.type === 'wordcloud'}
                                            onClick={() => addSlide('wordcloud')}
                                        />
                                        <TypeSelect
                                            icon={<FaFont />}
                                            label="Header"
                                            active={state.currentSlide.type === 'text'}
                                            onClick={() => addSlide('text')}
                                        />
                                    </div>
                                </section>

                                <section>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Entries</label>
                                    <div className="space-y-3">
                                        {Object.keys(state.currentSlide.options).map((opt, i) => (
                                            <div key={i} className="group relative">
                                                <input
                                                    disabled
                                                    value={opt}
                                                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm font-bold text-slate-700 px-4 py-3 rounded-xl outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                                                />
                                                <button className="absolute right-3 top-3.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <FaTrash size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        <button className="w-full py-3 rounded-xl border-dashed border-2 border-slate-100 text-xs font-bold text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all">
                                            Add Entry
                                        </button>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-50 py-10 gap-3">
                                <FaMagic size={24} className="text-slate-300" />
                                <span className="text-xs font-bold text-slate-400">Theme Designer Coming Soon</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// MINI COMPONENTS

const ToolbarIcon = ({ icon, active }: any) => (
    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-slate-100 text-blue-600 shadow-inner' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
        <span className="text-sm">{icon}</span>
    </button>
);

const TabButton = ({ label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {label}
    </button>
);

const TypeSelect = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl transition-all border-2 ${active
            ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
            : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:scale-105'
            }`}
    >
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-bold">{label}</span>
    </button>
);

const SlideVisualization = ({ slide, pollCounts }: any) => {
    if (slide.type === 'poll') {
        const total = Object.values(pollCounts).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
        return (
            <div className="w-full flex items-end justify-center gap-8 h-64 px-12">
                {Object.keys(slide.options).map((opt, i) => {
                    const count = Number((pollCounts as any)[opt]) || 0;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    // Modern "Linear" gradients
                    const grads = ['from-blue-500 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-red-500'];
                    return (
                        <div key={i} className="flex flex-col items-center gap-4 w-24 group cursor-default">
                            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                {count} votes
                            </div>
                            <div className="w-full h-full flex items-end bg-slate-100 rounded-t-2xl overflow-hidden relative">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${pct}%` }}
                                    transition={{ type: "spring", stiffness: 100 }}
                                    className={`w-full bg-gradient-to-t ${grads[i % 3]} opacity-90`}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500 text-center leading-tight">{opt}</span>
                        </div>
                    )
                })}
            </div>
        );
    }

    return (
        <div className="text-slate-300 flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                {slide.type === 'wordcloud' ? <FaCloud size={32} /> : <FaFont size={32} />}
            </div>
            <span className="font-bold text-sm tracking-wide uppercase opacity-70">Visualization Placeholder</span>
        </div>
    );
};

export default Presenter;
