import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-menti-bg flex flex-col items-center justify-center p-4 font-sans text-center">
            <h1 className="text-4xl font-extrabold text-[#2F2F2F] mb-6 tracking-tight">
                MentiClone
            </h1>

            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-menti-card border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Join a presentation</h2>

                <div className="space-y-4">
                    <input
                        placeholder="Enter code"
                        className="w-full p-3 text-center text-lg tracking-widest bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-menti-blue focus:ring-1 focus:ring-menti-blue transition-all"
                        disabled
                    />
                    <button
                        onClick={() => navigate('/student')}
                        className="w-full py-3 bg-menti-blue hover:bg-menti-blue-dark text-white font-bold rounded-md shadow-sm transition-all active:scale-[0.98]"
                    >
                        Join
                    </button>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    The code is usually 8 digits long.
                </div>
            </div>

            <div className="mt-8">
                <p className="text-gray-500 mb-2">Do you want to create a presentation?</p>
                <button
                    onClick={() => navigate('/presenter')}
                    className="text-menti-blue font-semibold hover:underline"
                >
                    Log in to MentiClone
                </button>
            </div>
        </div>
    );
};

export default Home;
