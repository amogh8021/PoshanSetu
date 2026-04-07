import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Heart } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
    phone: z.string().min(10, 'Enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async ({ phone, password }) => {
        setSubmitting(true);
        try {
            const decoded = await login(phone, password);
            showToast('Welcome back!', 'success');
            const role = decoded.role || decoded.roles?.[0];
            if (role === 'PARENT') navigate('/parent');
            else if (role === 'WORKER') navigate('/worker');
            else if (role === 'ADMIN') navigate('/admin');
            else navigate('/');
        } catch {
            showToast('Invalid phone number or password', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
                        <Heart className="text-white w-8 h-8" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">PoshanSetu</h1>
                    <p className="text-indigo-300 mt-1 text-sm">Nutrition & Health Monitoring</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Sign In</h2>
                    <p className="text-sm text-slate-400 mb-6">Enter your credentials to continue</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                {...register('phone')}
                                placeholder="9876543210"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm mt-2"
                        >
                            {submitting ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Contact your Anganwadi supervisor for access credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}
