import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import API from '../services/api';

const TypewriterText = ({ text }) => {
    const [displayText, setDisplayText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, [text]);

    return (
        <div className="inline-block relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 drop-shadow-sm font-black tracking-tight pr-1">
                {displayText}
                <span className={`text-blue-300 font-light ml-[1px] ${isTypingComplete ? 'animate-pulseSluggish' : ''}`}>|</span>
            </span>
        </div>
    );
};

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) navigate('/dashboard');
    }, [navigate]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await API.post('/auth/register', formData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Form Side with subtle background animation */}
            <div className="w-full md:w-1/2 flex justify-center items-center p-8 lg:p-12 relative overflow-hidden">
                {/* Subtle Left Side Blobs - Increased opacity and color depth for visibility */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>

                <div className="w-full max-w-md bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-xl shadow-gray-200/50 relative z-10 border border-white/50">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Create Account</h2>
                        <p className="text-gray-500">Start managing your expenses today</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">{error}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pl-10 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pl-10 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Password</label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    minLength="6"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pl-10 pr-10 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-medium rounded-lg text-base px-5 py-3.5 text-center shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 mt-2"
                        >
                            Create Account
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors">Log in back here</Link>
                    </p>
                </div>
            </div>

            {/* Right Visual Side - Shared visually with Login */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                {/* Animated Glassmorphic Blobs */}
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl">

                        {/* New Animated Branding Logo */}
                        <div className="mb-6 h-14 flex items-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl inline-flex shadow-sm items-center justify-center">
                                <span className="text-xl md:text-2xl mr-2 text-blue-200">✦</span>
                                <span className="text-xl md:text-2xl"><TypewriterText text="Sankhya Expenses" /></span>
                            </div>
                        </div>

                        <h3 className="text-3xl font-bold text-white mb-6 leading-tight">Master your money. <br /> Design your life.</h3>
                        <p className="text-blue-100 text-lg mb-8">Join thousands of users actively building wealth, optimizing expenses, and securing their financial future with Sankhya.</p>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-300 to-indigo-200 border-2 border-indigo-500 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm" style={{ zIndex: 10 - i }}>
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-white text-sm font-medium">Trusted by 10,000+ users</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
