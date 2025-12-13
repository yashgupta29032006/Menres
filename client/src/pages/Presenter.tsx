import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState, type SlideType } from '../types';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaChartBar, FaFont, FaCloud, FaBars, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage, FaTable, FaLink, FaListUl, FaListOl } from 'react-icons/fa';

/**
 * MENRES CORPORATE - PRESENTER DASHBOARD
 * Layout: Classic Slide Editor (PowerPoint-esque)
 * [ Header (Blue) ]
 * [ Slides | Toolbar + Canvas | Settings ]
 */

const Presenter = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [activeTab, setActiveTab] = useState<'settings' | 'options'>('settings');

    useEffect(() => {
        socket.on('state_update', (s) => setState(s));
        return () => {
            socket.off('state_update');
        };
    }, []);

    const addSlide = (type: SlideType = 'text') => {
        socket.emit('admin_control', {
            action: 'add_slide',
            value: { type, question: 'New Slide', options: type === 'poll' ? { 'Option 1': 0, 'Option 2': 0 } : {} }
        });
    };

    const setSlide = (index: number) => {
        socket.emit('admin_control', { action: 'set_slide', value: index });
    };

    const deleteSlide = (index: number) => {
        if (confirm('Delete slide?')) socket.emit('admin_control', { action: 'delete_slide', value: index });
    };

    return (
        <div className="h-screen flex flex-col bg-white text-corp-text font-sans overflow-hidden">

            {/* 1. CORPORATE HEADER */}
            <header className="h-14 bg-corp-primary flex items-center justify-between px-4 text-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                            <FaChartBar className="text-white" />
                        </div>
                        <span className="font-medium text-lg tracking-wide">Presenter's Dashboard</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm gap-2 opacity-80">
                        <span>Design:</span>
                        <span className="font-semibold px-2 py-1 bg-white/20 rounded border border-white/30">Corporate Clean v2</span>
                    </div>
                    <button className="bg-white text-corp-primary px-6 py-1.5 rounded font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                        Save
                    </button>
                </div>
            </header>

            {/* MAIN EDITOR AREA */}
            <div className="flex-1 flex overflow-hidden">

                {/* 2. FILMSTRIP SIDEBAR (Left) */}
                <div className="w-56 bg-gray-50 border-r border-gray-300 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {state.slides.map((slide, idx) => (
                            <div key={idx} className="flex gap-2">
                                <div className="w-6 text-right text-xs text-gray-400 py-1 font-mono">{idx + 1}</div>
                                <div
                                    onClick={() => setSlide(idx)}
                                    className={`flex-1 aspect-[16/9] bg-white border-2 cursor-pointer relative shadow-sm transition-all ${idx === state.currentSlideIndex ? 'border-corp-primary ring-2 ring-corp-primary/20' : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    {/* Mini Content Preview */}
                                    <div className="absolute inset-0 p-2 overflow-hidden flex flex-col items-center justify-center opacity-80 gap-1">
                                        <div className="w-full h-1 bg-corp-primary mb-1"></div>
                                        <div className="text-[6px] text-center leading-tight text-gray-500">{slide.question}</div>
                                        {slide.type === 'poll' && <FaChartBar size={8} className="text-gray-400" />}
                                    </div>

                                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx) }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 shadow-sm opacity-0 group-hover:opacity-100">
                                        <FaTrash size={8} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t border-gray-300 bg-gray-100">
                        <button onClick={() => addSlide('text')} className="w-full py-1 bg-white border border-gray-300 shadow-sm rounded text-sm font-medium hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2">
                            <FaPlus size={10} /> Add Slide
                        </button>
                    </div>
                </div>

                {/* 3. CENTER CANVAS + TOOLBAR */}
                <div className="flex-1 flex flex-col bg-gray-100 min-w-0">

                    {/* WYSIWYG TOOLBAR */}
                    <div className="h-10 bg-white border-b border-gray-300 flex items-center px-2 gap-1 overflow-x-auto">
                        <ToolbarBtn icon={<FaBars />} />
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <ToolbarBtn icon={<FaBold />} />
                        <ToolbarBtn icon={<FaItalic />} />
                        <ToolbarBtn icon={<FaUnderline />} />
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <ToolbarBtn icon={<FaAlignLeft />} />
                        <ToolbarBtn icon={<FaAlignCenter />} active />
                        <ToolbarBtn icon={<FaAlignRight />} />
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <ToolbarBtn icon={<FaListUl />} />
                        <ToolbarBtn icon={<FaListOl />} />
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <ToolbarBtn icon={<FaLink />} />
                        <ToolbarBtn icon={<FaImage />} />
                        <ToolbarBtn icon={<FaTable />} />
                    </div>

                    {/* SCROLLABLE CANVAS AREA */}
                    <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
                        <div className="w-[800px] aspect-[4/3] bg-white shadow-paper border border-gray-300 relative shrink-0">

                            {/* BLUE BORDERS (Classic Look) */}
                            <div className="absolute top-0 bottom-0 left-0 w-8 bg-corp-primary"></div>
                            <div className="absolute top-0 bottom-0 right-0 w-8 bg-corp-primary"></div>

                            <div className="absolute inset-0 px-16 py-12 flex flex-col">
                                <h1 className="text-3xl font-bold text-center mb-8 text-black">{state.currentSlide.question}</h1>

                                <div className="flex-1 border border-dashed border-gray-200 rounded flex items-center justify-center bg-gray-50/50">
                                    <CanvasResults slide={state.currentSlide} pollCounts={state.pollCounts} responses={state.responses} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SETTINGS SIDEBAR (Right) */}
                <div className="w-72 bg-white border-l border-gray-300 flex flex-col">
                    {/* TABS */}
                    <div className="flex border-b border-gray-300 bg-gray-50">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'settings' ? 'border-corp-primary text-corp-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('options')}
                            className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'options' ? 'border-corp-primary text-corp-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Options
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {activeTab === 'settings' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Question Type</label>
                                    <div className="w-full border border-gray-300 rounded shadow-sm bg-white overflow-hidden">
                                        <button onClick={() => addSlide('poll')} className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 ${state.currentSlide.type === 'poll' ? 'bg-blue-50 text-corp-primary font-bold' : ''}`}>
                                            <FaChartBar size={12} /> Poll
                                        </button>
                                        <button onClick={() => addSlide('wordcloud')} className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100 ${state.currentSlide.type === 'wordcloud' ? 'bg-blue-50 text-corp-primary font-bold' : ''}`}>
                                            <FaCloud size={12} /> Word Cloud
                                        </button>
                                        <button onClick={() => addSlide('text')} className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100 ${state.currentSlide.type === 'text' ? 'bg-blue-50 text-corp-primary font-bold' : ''}`}>
                                            <FaFont size={12} /> Text Slide
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Options</label>
                                    <div className="space-y-2">
                                        {Object.keys(state.currentSlide.options).map((opt, i) => (
                                            <div key={i} className="flex gap-2">
                                                <input disabled value={opt} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-500" />
                                                <button className="text-gray-400 hover:text-red-500"><FaTrash size={12} /></button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <input disabled placeholder="Add option" className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 cursor-not-allowed" />
                                            <button className="text-gray-400" disabled><FaPlus size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'options' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" className="rounded border-gray-300 text-corp-primary focus:ring-corp-primary" />
                                        Show results
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" className="rounded border-gray-300 text-corp-primary focus:ring-corp-primary" />
                                        Close voting
                                    </label>
                                </div>
                                <hr className="border-gray-200" />
                                <button className="w-full py-1.5 border border-gray-300 rounded shadow-sm text-sm font-semibold hover:bg-gray-50 text-gray-700">
                                    Export Results
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-300 bg-gray-50">
                        <button className="w-full bg-corp-primary text-white py-2 rounded shadow-sm text-sm font-bold hover:bg-corp-secondary" onClick={() => socket.emit('admin_control', { action: 'toggle_active', value: !state.isActive })}>
                            {state.isActive ? 'Stop Presenting' : 'Start Presenting'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolbarBtn = ({ icon, active }: any) => (
    <button className={`p-1.5 rounded text-gray-600 hover:bg-gray-100 ${active ? 'bg-gray-200 text-black shadow-inner' : ''}`}>
        <span className="text-sm">{icon}</span>
    </button>
);

const CanvasResults = ({ slide, pollCounts, responses }: any) => {
    // Standard Office Colors
    const colors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

    if (slide.type === 'poll') {
        const total = Object.values(pollCounts).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
        return (
            <div className="w-full max-w-lg h-64 flex items-end justify-center gap-8 px-8 pb-4 border-b border-l border-gray-400">
                {Object.keys(slide.options).map((opt, idx) => {
                    const count = Number((pollCounts as any)[opt]) || 0;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    const barColor = colors[idx % colors.length];

                    return (
                        <div key={opt} className="flex flex-col items-center gap-2 w-16 h-full justify-end">
                            <span className="text-xs font-bold text-gray-600">{count}</span>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${pct}%` }}
                                className={`w-full ${barColor} hover:opacity-90 transition-opacity`}
                            />
                            <span className="text-xs font-semibold text-gray-800 text-center truncate w-full">{opt}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    // Word Cloud & Text fallback
    return (
        <div className="text-center">
            {responses.length === 0 ? <span className="text-gray-400 italic">Waiting for input...</span> :
                <div className="flex flex-wrap gap-2 justify-center">
                    {responses.map((r: any, i: number) => <span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{r.content}</span>)}
                </div>}
        </div>
    )
}

export default Presenter;
