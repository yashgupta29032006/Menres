import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

const Student = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [connected, setConnected] = useState(socket.connected);
    const [inputVal, setInputVal] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    useEffect(() => {
        function onConnect() {
            setConnected(true);
        }
        function onDisconnect() {
            setConnected(false);
        }
        function onStateUpdate(newState: AppState) {
            // Whenever slide changes, reset submitted state unless we track it by slide ID
            // For simplicity, we just reset on slide index change
            setState(prev => {
                if (prev.currentSlide.id !== newState.currentSlide.id) {
                    setSubmitted(false);
                    setInputVal('');
                    setMessage(null);
                }
                return newState;
            });
        }

        function onSuccess(msg: string) {
            setMessage({ type: 'success', text: msg });
            setSubmitted(true);
        }

        function onError(msg: string) {
            setMessage({ type: 'error', text: msg });
            setSubmitted(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('state_update', onStateUpdate);
        socket.on('success_message', onSuccess);
        socket.on('error_message', onError);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('state_update', onStateUpdate);
            socket.off('success_message', onSuccess);
            socket.off('error_message', onError);
        };
    }, []);

    const handleSubmit = () => {
        if (!inputVal && state.currentSlide.type !== 'poll') return;

        socket.emit('submit_response', {
            type: state.currentSlide.type,
            content: inputVal
        });
    };

    const currentSlide = state.currentSlide;

    return (
        <div className="min-h-screen bg-dark-bg text-white flex flex-col p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <header className="flex justify-between items-center py-4 px-2 mb-8 border-b border-white/10">
                <div className="font-bold text-xl tracking-tight">MentiClone</div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {connected ? 'Live' : 'Offline'}
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center max-w-xl w-full mx-auto">
                <AnimatePresence mode="wait">
                    {!state.isActive ? (
                        <motion.div
                            key="paused"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center p-8 bg-card-bg rounded-2xl border border-dashed border-white/20"
                        >
                            <div className="text-4xl mb-4">⏸️</div>
                            <h2 className="text-2xl font-bold mb-2">Session Paused</h2>
                            <p className="text-gray-400">The presenter has paused the session. Stay tuned!</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={currentSlide.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            <div className="bg-card-bg backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white/10">
                                <span className="text-accent text-xs font-bold tracking-wider uppercase mb-2 block">
                                    {currentSlide.type === 'wordcloud' ? 'Word Cloud' : currentSlide.type === 'poll' ? 'Poll' : 'Q&A'}
                                </span>
                                <h2 className="text-3xl font-bold mb-8 leading-tight">{currentSlide.question}</h2>

                                {submitted && state.currentSlide.type !== 'poll' ? (
                                    <div className="text-center py-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                                        >
                                            ✓
                                        </motion.div>
                                        <p className="text-lg font-semibold">Response Sent!</p>
                                        <p className="text-gray-400 text-sm mt-2">Wait for the next slide...</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="mt-6 text-sm text-accent hover:text-white underline"
                                        >
                                            Submit another response?
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {currentSlide.type === 'poll' && (
                                            <div className="grid gap-3">
                                                {Object.keys(currentSlide.options).map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            setInputVal(opt);
                                                            // Auto submit for polls or wait for button? 
                                                            // Let's set value and user clicks submit for consistency, or auto. 
                                                            // UX: Select then Submit is safer.
                                                        }}
                                                        className={`p-4 rounded-xl text-left transition-all border ${inputVal === opt
                                                            ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {(currentSlide.type === 'text' || currentSlide.type === 'wordcloud') && (
                                            <input
                                                type="text"
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                placeholder="Type your answer here..."
                                                className="w-full bg-black/20 border border-white/20 rounded-xl p-4 text-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                                autoFocus
                                            />
                                        )}

                                        <button
                                            onClick={handleSubmit}
                                            disabled={!inputVal || (state.currentSlide.type === 'poll' && submitted)}
                                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-6 transition-all ${!inputVal || (state.currentSlide.type === 'poll' && submitted)
                                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                                : 'bg-gradient-to-r from-accent to-purple-600 hover:shadow-lg hover:shadow-accent/40 active:scale-95'
                                                }`}
                                        >
                                            {submitted && state.currentSlide.type === 'poll' ? 'Voted' : (
                                                <>
                                                    Submit <FaPaperPlane className="text-sm" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mt-4 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                                            }`}
                                    >
                                        {message.text}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Student;
