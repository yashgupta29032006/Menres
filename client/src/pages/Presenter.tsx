import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState, type SlideType } from '../types';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaChartBar, FaFont, FaCloud, FaCog, FaCheck } from 'react-icons/fa';

/**
 * MENTIMETER CLONE - PRESENTER VIEW
 * Layout: 3-Column SaaS Editor
 * [Thumbnails] [       Canvas       ] [Settings/Editor]
 */

const Presenter = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [connected, setConnected] = useState(socket.connected);

    // Local edit states (for optimistic UI in rich editor)
    const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

    useEffect(() => {
        socket.on('state_update', (s) => {
            setState(s);
            // Sync local edit state when slide changes
            // Only update if we aren't actively typing (simple check: if IDs differ)
            // For a hackathon level, we'll just sync when the slide ID changes to avoid overwriting typing.
        });
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        return () => {
            socket.off('state_update');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    // Sync effect when current slide changes remotely
    useEffect(() => {
        /* No-op for now */
    }, [state.currentSlideIndex, state.slides.length]); // Dependencies to reset on nav

    // ACTIONS
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

    const toggleActive = () => socket.emit('admin_control', { action: 'toggle_active', value: !state.isActive });

    return (
        <div className="h-screen flex flex-col bg-[#F4F5F7] text-menti-dark-text font-sans overflow-hidden">
            {/* TOP NAVIGATION */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-xl tracking-tight text-menti-dark-text">Menti<span className="text-menti-blue">Clone</span></div>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <div className="text-sm text-gray-500 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">My presentation</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {connected ? 'Saved' : 'Connecting...'}
                    </div>
                    <button
                        onClick={toggleActive}
                        className="bg-menti-blue hover:bg-menti-blue-dark text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                    >
                        {state.isActive ? 'Present' : 'Resume'}
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 text-menti-dark-text px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                        Share
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* LEFT COLUMN: SLIDE STRIP */}
                <div className="w-48 bg-white border-r border-gray-200 flex flex-col z-10">
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {state.slides.map((slide, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSlide(idx)}
                                className={`relative group p-2 rounded-lg cursor-pointer border-2 transition-all ${idx === state.currentSlideIndex
                                    ? 'border-menti-blue bg-blue-50/50'
                                    : 'border-transparent hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                                    {idx === state.currentSlideIndex && <div className="w-2 h-2 rounded-full bg-menti-blue"></div>}
                                </div>

                                {/* Mini Thumbnail Representation */}
                                <div className="aspect-video bg-white border border-gray-200 rounded flex items-center justify-center mb-1 overflow-hidden">
                                    {slide.type === 'poll' && <FaChartBar className="text-gray-300 text-xl" />}
                                    {slide.type === 'text' && <FaFont className="text-gray-300 text-xl" />}
                                    {slide.type === 'wordcloud' && <FaCloud className="text-gray-300 text-xl" />}
                                </div>

                                <div className="hidden group-hover:flex absolute top-2 right-2 bg-white shadow rounded-md p-1 gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx) }} className="text-red-500 hover:bg-red-50 p-1 rounded"><FaTrash size={10} /></button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => addSlide('text')}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-menti-blue hover:text-menti-blue transition-colors flex flex-col items-center gap-1"
                        >
                            <FaPlus />
                            <span className="text-xs font-semibold">New Slide</span>
                        </button>
                    </div>
                </div>

                {/* CENTER COLUMN: CANVAS */}
                <div className="flex-1 bg-[#F4F5F7] flex flex-col relative overflow-hidden">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-full text-xs font-mono text-gray-500 shadow-sm z-10">
                        Join code: <span className="font-bold text-black">12 34 56</span> (Localhost)
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                        <div className="w-full max-w-4xl aspect-[4/3] bg-white rounded shadow-menti-card flex flex-col overflow-hidden relative">
                            {/* This simulates the slide content */}
                            <div className="flex-1 p-12 flex flex-col">
                                <h1 className="text-4xl font-bold text-center mb-8">{state.currentSlide.question}</h1>

                                <div className="flex-1 flex items-center justify-center w-full">
                                    <CanvasResults slide={state.currentSlide} pollCounts={state.pollCounts} responses={state.responses} />
                                </div>
                            </div>

                            {/* Footer info bar */}
                            <div className="h-10 bg-gray-50 border-t border-gray-100 flex items-center justify-between px-4 text-xs text-gray-400">
                                <span>MentiClone</span>
                                <span>{state.responses.length} responses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: SETTINGS/EDITOR */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'content' ? 'border-menti-blue text-menti-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Type
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'design' ? 'border-menti-blue text-menti-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Content
                        </button>
                        <button className="px-4 text-gray-400 hover:text-gray-600"><FaCog /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                        {activeTab === 'content' && (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Slide Type</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <TypeButton
                                            icon={<FaChartBar />}
                                            label="Poll"
                                            active={state.currentSlide.type === 'poll'}
                                            onClick={() => addSlide('poll')}
                                        />
                                        <TypeButton
                                            icon={<FaCloud />}
                                            label="Word Cloud"
                                            active={state.currentSlide.type === 'wordcloud'}
                                            onClick={() => addSlide('wordcloud')}
                                        />
                                        <TypeButton
                                            icon={<FaFont />}
                                            label="Q&A / Text"
                                            active={state.currentSlide.type === 'text'}
                                            onClick={() => addSlide('text')}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                                    <h4 className="font-bold flex items-center gap-2 mb-1"><FaCheck /> Pro Tip</h4>
                                    <p>Select a type above to create a new slide of that type. Editing existing types is not supported in this clones MVP.</p>
                                </div>
                            </>
                        )}

                        {activeTab === 'design' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Content</h3>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Question</label>
                                    <input
                                        disabled
                                        value={state.currentSlide.question}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400">To change the question, add a new slide.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TypeButton = ({ icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${active
            ? 'border-menti-blue bg-blue-50 text-menti-blue ring-1 ring-menti-blue'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
            }`}
    >
        <div className="text-xl mb-2">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const CanvasResults = ({ slide, pollCounts, responses }: any) => {
    if (slide.type === 'poll') {
        const total = Object.values(pollCounts).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
        return (
            <div className="w-full max-w-lg space-y-4">
                {Object.keys(slide.options).map(opt => {
                    const count = Number((pollCounts as any)[opt]) || 0;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    return (
                        <div key={opt} className="relative group">
                            <div className="flex justify-between text-sm font-semibold mb-1 text-gray-700">
                                <span>{opt}</span>
                                <span className={count > 0 ? 'text-menti-blue' : 'text-gray-400'}>{count}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    className="h-full bg-menti-blue"
                                    transition={{ type: 'spring', stiffness: 50 }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    if (slide.type === 'wordcloud') {
        // Mock visual for word cloud
        return (
            <div className="flex flex-wrap justify-center gap-4 text-center">
                {responses.map((r: any, i: number) => (
                    <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-menti-blue inline-block m-2"
                        style={{ fontSize: (Math.random() * 2 + 1) + 'rem', opacity: Math.random() * 0.5 + 0.5 }}
                    >
                        {r.content}
                    </motion.span>
                ))}
                {responses.length === 0 && <span className="text-gray-300 text-xl font-bold">Waiting for words...</span>}
            </div>
        )
    }

    return (
        <div className="w-full max-w-xl grid gap-3">
            {responses.map((r: any) => (
                <motion.div
                    key={r.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center font-medium text-lg"
                >
                    {r.content}
                </motion.div>
            ))}
            {responses.length === 0 && <span className="text-gray-300 text-xl font-bold text-center">Waiting for answers...</span>}
        </div>
    )
}

export default Presenter;
