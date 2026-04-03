import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSmartphone, FiUser, FiPhone, FiLock, FiArrowRight, FiMail } from "react-icons/fi";
import homeBg from '../assets/HomeBg/img2.png';
import logo from '../assets/logo.png';
import Navbar from './Navbar';
import { supabase } from '../SupabaseClient';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: formData.phone,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert into public.users table (role defaults to 'staff' or as set in DB)
                const userData = {
                    id: authData.user.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    role: 'staff',
                    created_at: new Date()
                };

                const { error: profileError } = await supabase
                    .from('users')
                    .insert([userData]);

                if (profileError) throw profileError;

                // 3. Handle Auto-Login or Verification
                if (authData.session) {
                    // If Supabase returns a session, auto-login the user
                    localStorage.setItem('invox_user', JSON.stringify(userData));
                    navigate('/dashboard');
                } else {
                    // If email verification is enabled, they need to log in manually
                    alert('Account created! Please check your email to verify your account, then log in.');
                    navigate('/login');
                }
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
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

                    <div className="bg-zinc-900/40 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl p-6 flex flex-col gap-8 animate-fade-in relative z-10">
                        <div className="flex flex-col gap-2">
                            <Link to="/" className="flex items-center gap-2 group mx-auto w-fit">
                                <img src={logo} alt="Invox Logo" className="h-10 w-auto bg-white p-1 rounded-lg" />
                            </Link>
                            <h1 className="text-4xl text-white mt-4 tracking-tight text-center">Create Account</h1>
                            <p className="text-zinc-500 font-medium text-center">Join the next generation of billing.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="relative group">
                                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-3 pl-14 pr-6 focus:border-white/20 transition-all outline-none font-medium text-white placeholder:text-zinc-700"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-3 pl-14 pr-6 focus:border-white/20 transition-all outline-none font-medium text-white placeholder:text-zinc-700"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-3 pl-14 pr-6 focus:border-white/20 transition-all outline-none font-medium text-white placeholder:text-zinc-700"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-3 pl-14 pr-6 focus:border-white/20 transition-all outline-none font-medium text-white placeholder:text-zinc-700"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-red-500 text-xs font-semibold px-2 text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-white text-black py-3 rounded-2xl font-black text-md flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95 mt-2 uppercase tracking-widest disabled:opacity-50 shadow-[0_10px_40px_rgba(255,255,255,0.05)]"
                            >
                                {loading ? 'Registering...' : 'Get Started'}
                                <FiArrowRight size={20} className="stroke-[3]" />
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-zinc-500 font-medium text-sm">
                                Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Login</Link>
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

export default SignUp