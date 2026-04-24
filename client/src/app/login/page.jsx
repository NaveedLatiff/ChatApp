"use client"
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify';
import img from '../../assets/main.png'
import Image from 'next/image';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const { login, register } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            if (isLogin) {
                await login({
                    email: formData.email,
                    password: formData.password
                })
            } else {
                await register(formData)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Authentication failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-b from-black via-zinc-900 to-black">
            <div className="  hidden lg:flex items-center justify-center p-12 relative overflow-hidden">
                <Image
                    src={img}
                    alt="Branding Image"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="flex items-center justify-center p-6 sm:p-12 font-outfit">
                <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-10 shadow-2xl">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-[#e9edef] font-outfit">
                            {isLogin ? <span > Welcome <span className='text-orange-500'>Back</span> </span> : <span > Create <span className='text-orange-500'>Account</span> </span>}
                        </h2>
                        <p className="text-[#8696a0] mt-2">
                            {isLogin ? 'Enter your details to stay connected' : <span>Join <span className='italic text-orange-500 underline'>Pingly</span> today</span>}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-medium text-[#8696a0] ml-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-zinc-900/80 border-none text-[#e9edef] py-3 px-4 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-[#8696a0]"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#8696a0] ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-zinc-900/80 border-none text-[#e9edef] py-3 px-4 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-[#8696a0]"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#8696a0] ml-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-zinc-900/80 border-none text-[#e9edef] py-3 px-4 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-[#8696a0]"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-400 via-orange-700 to-orange-900 text-white cursor-pointer  hover:bg-none hover:bg-white hover:text-black  font-bold  py-3 rounded-lg transition-all transform active:scale-[0.98] mt-4 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="pt-6 text-center">
                        <p className="text-[#8696a0] text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-orange-400 cursor-pointer hover:underline font-semibold transition-colors"
                            >
                                {isLogin ? 'Create one now' : 'Login here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage