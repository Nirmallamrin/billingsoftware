import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSmartphone, FiLock, FiArrowRight, FiMail } from "react-icons/fi";
import homeBg from '../assets/HomeBg/img2.png';
import logo from '../assets/logo.png';
import { supabase } from '../SupabaseClient';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Fetch role from public.users table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (userError) throw userError;

                // 3. Store user data in localStorage for persistence
                localStorage.setItem('invox_user', JSON.stringify(userData));

                // 4. Navigate to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className='mt-10'>
                <div className="relative min-h-screen flex items-center justify-center p-6 font-sans overflow-hidden">
                    {/* Background identical to Home Page */}
                    <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black -z-40"></div>
                    <img
                        src={homeBg}
                        alt=""
                        className="fixed inset-0 w-full h-full object-cover -z-30 pointer-events-none opacity-20 mix-blend-luminosity"
                    />
                    <div className="fixed inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] -z-20 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 via-transparent to-black/80 -z-10"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-multiply -z-10"></div>

                    <div className="bg-zinc-900/40 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl p-10 flex flex-col gap-10 animate-fade-in relative z-10">
                        <div className="flex flex-col gap-2 text-center">
                            <Link to="/" className="flex items-center gap-2 group mx-auto w-fit">
                                <img src={logo} alt="Invox Logo" className="h-10 w-auto bg-white p-1 rounded-lg" />
                            </Link>
                            <h1 className="text-4xl font-black text-white mt-8 tracking-tight">Welcome Back</h1>
                            <p className="text-zinc-500 font-medium">Precision billing at your fingertips.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="relative group">
                                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:border-white/20 transition-all outline-none font-medium text-white placeholder:text-zinc-700"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>


                            <div className="relative group">
                                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:border-white/20 transition-all outline-none font-medium text-white placeholder:text-zinc-700"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm font-semibold px-2 text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-white text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95 mt-4 uppercase tracking-widest disabled:opacity-50 shadow-[0_10px_40px_rgba(255,255,255,0.05)]"
                            >
                                {loading ? 'Authenticating...' : 'Sign In'}
                                <FiArrowRight size={20} className="stroke-[3]" />
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-zinc-500 font-medium text-sm">
                                New to Invox? <Link to="/signup" className="text-white font-bold hover:underline">Get Started</Link>
                            </p>
                        </div>
                    </div>

                    <style>
                        {`
                @keyframes fade-in {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                `}
                    </style>
                </div>
            </div>
        </div>
    )
}

export default Login