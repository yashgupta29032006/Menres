import { useNavigate } from 'react-router-dom';
import { FaLock, FaArrowRight } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-4 font-sans text-brand-dark">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary mb-4">
                        <FaLock />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Restricted Access</h1>
                    <p className="text-gray-500 text-sm mt-1">Enter your access code to join the session.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-deep border border-gray-100">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1">Access Code</label>
                            <input
                                type="text"
                                placeholder="1234 5678"
                                className="w-full text-center text-xl font-mono tracking-widest py-3 border-2 border-gray-200 rounded-xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1">Your Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full text-center px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                            />
                        </div>

                        <button
                            onClick={() => navigate('/student')}
                            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            Join Session
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    Powered by <span className="font-bold text-gray-500">MenRes Premium</span>
                </div>

                <div className="mt-2 text-center">
                    <button onClick={() => navigate('/presenter')} className="text-xs text-brand-primary font-medium hover:underline">
                        Host Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
