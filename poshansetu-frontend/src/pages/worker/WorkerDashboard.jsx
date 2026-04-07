import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard, RiskBadge, LoadingSpinner, EmptyState } from '../../components';
import { registerChild, getChildrenForAnganwadi } from '../../api/childApi';
import { recordHealth } from '../../api/healthApi';
import { recordVaccination } from '../../api/vaccineApi';
import { getMalnutritionStats } from '../../api/adminApi';
import { markAttendance, getTodayAttendance } from '../../api/attendanceApi';
import { registerPregnancy, listPregnancies } from '../../api/pregnancyApi';
import { Baby, Weight, Syringe, AlertTriangle, Search, LogOut, Heart, X, Plus, ChevronRight, ClipboardCheck, Users } from 'lucide-react';

const attendanceSchema = z.object({
    childId: z.string().min(1),
    status: z.enum(['PRESENT', 'ABSENT', 'LEAVE']),
    anganwadiId: z.string().min(1),
});

const pregnancySchema = z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    anganwadiId: z.string().min(1),
    age: z.coerce.number().int().positive(),
    systolicBP: z.coerce.number().int().positive(),
    diastolicBP: z.coerce.number().int().positive(),
    bloodSugar: z.coerce.number().positive(),
    bodyTemp: z.coerce.number().positive(),
    heartRate: z.coerce.number().int().positive(),
});

const childSchema = z.object({
    fullName: z.string().min(2),
    dateOfBirth: z.string().min(1, 'Required'),
    gender: z.enum(['MALE', 'FEMALE']),
    parentPhone: z.string().min(10),
    motherName: z.string().min(2),
    anganwadiId: z.string().min(1, 'Required'),
    parentPassword: z.string().optional(),
});

const healthSchema = z.object({
    childId: z.string().min(1),
    weightKg: z.coerce.number().positive(),
    heightCm: z.coerce.number().positive(),
    muacCm: z.coerce.number().positive(),
    motherEducation: z.string().min(1),
    stunting: z.string().min(1),
    anemia: z.string().min(1),
    malaria: z.string().min(1),
    diarrhea: z.string().min(1),
    tb: z.string().min(1),
});

const vaccineSchema = z.object({
    childId: z.string().min(1),
    vaccineName: z.string().min(1),
    status: z.enum(['DONE', 'MISSED']),
    scheduledDate: z.string().min(1),
});

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

function FormField({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
    );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

export default function WorkerDashboard() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [modal, setModal] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [currentAnganwadiId, setCurrentAnganwadiId] = useState(user?.anganwadiId || '');
    const [attendance, setAttendance] = useState({});
    const [pregnancies, setPregnancies] = useState([]);
    const [loadingPregnancies, setLoadingPregnancies] = useState(false);
    const [activeTab, setActiveTab] = useState('children'); // 'children' or 'pregnancy'

    // Poll for risk alerts every 5 mins
    useEffect(() => {
        const fetchAlerts = () =>
            getMalnutritionStats().then((r) => {
                const data = r.data?.data;
                setAlerts(Array.isArray(data) ? data : []);
            }).catch(() => { });
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchChildren = useCallback(() => {
        if (!currentAnganwadiId) return;
        setLoadingChildren(true);
        const p1 = getChildrenForAnganwadi(currentAnganwadiId)
            .then(r => setChildren(r.data?.data || []));
        const p2 = getTodayAttendance(currentAnganwadiId)
            .then(r => {
                const map = {};
                (r.data?.data || []).forEach(a => map[a.childId] = { status: a.status, mealEaten: a.mealEaten });
                setAttendance(map);
            });
        
        Promise.all([p1, p2])
            .catch(() => showToast('Failed to fetch data', 'error'))
            .finally(() => setLoadingChildren(false));
    }, [currentAnganwadiId, showToast]);

    const fetchPregnancies = useCallback(() => {
        if (!currentAnganwadiId) return;
        setLoadingPregnancies(true);
        listPregnancies(currentAnganwadiId)
            .then(r => setPregnancies(r.data?.data || []))
            .finally(() => setLoadingPregnancies(false));
    }, [currentAnganwadiId]);

    useEffect(() => {
        fetchChildren();
        if (activeTab === 'pregnancy') fetchPregnancies();
    }, [fetchChildren, fetchPregnancies, activeTab]);

    const openModal = (type, child = null) => {
        setSelectedChild(child);
        if (child) {
            if (type === 'health') healthForm.setValue('childId', child.id);
            if (type === 'vaccine') vaccineForm.setValue('childId', child.id);
        } else {
            healthForm.reset();
            vaccineForm.reset();
        }
        setModal(type);
    };

    const childForm = useForm({ resolver: zodResolver(childSchema) });
    const healthForm = useForm({ resolver: zodResolver(healthSchema) });
    const vaccineForm = useForm({ resolver: zodResolver(vaccineSchema) });
    const pregnancyForm = useForm({ resolver: zodResolver(pregnancySchema) });

    const onRegisterChild = async (data) => {
        setSubmitting(true);
        try {
            await registerChild(data);
            showToast('Child registered successfully!', 'success');
            setModal(null);
            childForm.reset();
            fetchChildren();
        } catch { showToast('Failed to register child', 'error'); }
        finally { setSubmitting(false); }
    };

    const onRecordHealth = async (data) => {
        setSubmitting(true);
        try {
            const res = await recordHealth(data);
            const result = res.data?.data;
            setPrediction(result?.mlPrediction || null);
            showToast(`Health recorded! Risk: ${result?.mlPrediction || 'N/A'}`, 'success');
            setModal(null);
            healthForm.reset();
            fetchChildren(); // Refresh list to show badge
        } catch { showToast('Failed to record health data', 'error'); }
        finally { setSubmitting(false); }
    };

    const onRecordVaccine = async (data) => {
        setSubmitting(true);
        try {
            await recordVaccination(data);
            showToast('Vaccination recorded!', 'success');
            setModal(null);
            vaccineForm.reset();
            fetchChildren(); // Refresh
        } catch { showToast('Failed to record vaccination', 'error'); }
        finally { setSubmitting(false); }
    };

    const onMarkAttendance = async (childId, status, mealEaten = false) => {
        try {
            await markAttendance({ childId, status, anganwadiId: currentAnganwadiId, mealEaten });
            setAttendance(prev => ({ ...prev, [childId]: { status, mealEaten } }));
            showToast('Attendance updated', 'success');
        } catch { showToast('Failed to update attendance', 'error'); }
    };

    const onRegisterPregnancy = async (data) => {
        setSubmitting(true);
        try {
            await registerPregnancy(data);
            showToast('Pregnancy registered!', 'success');
            setModal(null);
            pregnancyForm.reset();
            fetchPregnancies();
        } catch { showToast('Failed to register pregnancy', 'error'); }
        finally { setSubmitting(false); }
    };

    const highRiskAlerts = (Array.isArray(alerts) ? alerts : []).filter(a => ['SEVERE', 'HIGH', 'Severe', 'High', 'MODERATE', 'Moderate'].includes(a.riskLevel || a.mlPrediction));

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Heart size={16} className="text-white" fill="white" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 text-sm">PoshanSetu</span>
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Worker</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search child…"
                            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48" />
                    </div>
                    <button onClick={logout} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut size={15} />
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                {/* Center UID Prompt */}
                {!currentAnganwadiId && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-amber-800">Missing Center UID</h3>
                                <p className="text-sm text-amber-700 mt-1">Your profile doesn't have a Center UID associated. You must enter your Anganwadi UID (e.g., AW1234) below to view and manage children.</p>
                                <div className="mt-4 flex gap-2 max-w-sm">
                                    <input 
                                        type="text" 
                                        placeholder="Enter UID (e.g. AW1234)" 
                                        className="flex-1 px-4 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        id="manual-uid-input"
                                    />
                                    <button 
                                        onClick={() => {
                                            const val = document.getElementById('manual-uid-input').value;
                                            if (val) {
                                                setCurrentAnganwadiId(val);
                                                showToast('Center UID set for session!', 'success');
                                            }
                                        }}
                                        className="bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-amber-700 transition">
                                        Set UID
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard title="Actions Today" value="Ready" subtitle="Log health, vaccines, or children" icon={Baby} color="indigo" />
                    <StatCard title="Risk Alerts" value={highRiskAlerts.length} subtitle="children flagged today" icon={AlertTriangle} color="red" />
                    <StatCard title="Quick Actions" value="3" subtitle="forms available below" icon={Plus} color="emerald" />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Child', icon: Baby, modal: 'child', color: 'bg-indigo-600 hover:bg-indigo-700' },
                        { label: 'Health', icon: Weight, modal: 'health', color: 'bg-emerald-600 hover:bg-emerald-700' },
                        { label: 'Vaccine', icon: Syringe, modal: 'vaccine', color: 'bg-amber-500 hover:bg-amber-600' },
                        { label: 'Pregnancy', icon: Heart, modal: 'pregnancy', color: 'bg-pink-500 hover:bg-pink-600' },
                    ].map(({ label, icon: IconComponent, modal: m, color }) => (
                        <button key={m} onClick={() => openModal(m)}
                            className={`${color} text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg`}>
                            <IconComponent size={20} /> {label}
                        </button>
                    ))}
                </div>

                {/* Last prediction result */}
                {prediction && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="text-sm text-slate-600">Last ML Prediction:</div>
                        <RiskBadge level={prediction} />
                    </div>
                )}

                {/* Main Views */}
                <div className="flex border-b border-slate-200 gap-6 px-1">
                    <button onClick={() => setActiveTab('children')} className={`pb-3 text-sm font-bold transition ${activeTab === 'children' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Children</button>
                    <button onClick={() => setActiveTab('pregnancy')} className={`pb-3 text-sm font-bold transition ${activeTab === 'pregnancy' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Pregnant Women</button>
                </div>

                {activeTab === 'children' ? (
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700 font-display">Registered Children</h3>
                        <span className="text-xs text-slate-400">{children.length} total</span>
                    </div>
                    
                    {loadingChildren ? (
                        <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                    ) : children.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Child Name</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Health Risk</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Attendance</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Last Vaccine</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {children.filter(c => c.child.fullName.toLowerCase().includes(search.toLowerCase())).map(({ child, latestRiskLevel, lastVaccine }) => (
                                        <tr key={child.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-2">
                                                <p className="text-sm font-medium text-slate-700">{child.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{child.id.substring(0, 8)}...</p>
                                            </td>
                                            <td className="py-3 px-2">
                                                <RiskBadge level={latestRiskLevel} />
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex flex-col gap-1">
                                                    <select 
                                                        value={attendance[child.id]?.status || ''} 
                                                        onChange={(e) => onMarkAttendance(child.id, e.target.value, attendance[child.id]?.mealEaten)}
                                                        className="text-[10px] bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-indigo-400 py-1"
                                                    >
                                                        <option value="">Status</option>
                                                        <option value="PRESENT">Present</option>
                                                        <option value="ABSENT">Absent</option>
                                                        <option value="LEAVE">Leave</option>
                                                    </select>
                                                    {attendance[child.id]?.status === 'PRESENT' && (
                                                        <label className="flex items-center gap-1 cursor-pointer group">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={attendance[child.id]?.mealEaten || false}
                                                                onChange={(e) => onMarkAttendance(child.id, 'PRESENT', e.target.checked)}
                                                                className="w-3 h-3 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-[9px] text-slate-500 group-hover:text-indigo-600 transition-colors">Meal?</span>
                                                        </label>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-xs text-slate-600">
                                                {lastVaccine || 'None'}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openModal('health', child)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                        <Weight size={14} />
                                                    </button>
                                                    <button onClick={() => openModal('vaccine', child)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                                                        <Syringe size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-10 text-center text-sm text-slate-400 font-display italic">No children registered in this center yet. Click "Child" at the top to add one.</div>
                    )}
                </div>
                ) : (
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-700">Pregnant Women</h3>
                        <span className="text-xs text-slate-400">{pregnancies.length} active</span>
                    </div>
                    {loadingPregnancies ? <LoadingSpinner /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-display">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Name</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Trimester</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Hemoglobin</th>
                                        <th className="pb-3 text-xs font-semibold text-slate-400 px-2">Risk</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pregnancies.map((p) => (
                                        <tr key={p.id}>
                                            <td className="py-3 px-2 text-sm text-slate-700 font-medium">User ID: {p.userId.substring(0, 8)}...</td>
                                            <td className="py-3 px-2 text-sm text-slate-600">{p.trimester}</td>
                                            <td className="py-3 px-2 text-sm text-slate-600">{p.hemoglobin} g/dL</td>
                                            <td className="py-3 px-2"><RiskBadge level={p.riskLevel} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                )}

                {/* Risk Alerts Panel */}
                {highRiskAlerts.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <AlertTriangle size={15} className="text-red-500" /> Risk Alerts
                        </h3>
                        <div className="space-y-2">
                            {highRiskAlerts.map((alert, i) => (
                                <div key={i} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3">
                                    <p className="text-sm font-medium text-slate-800">{alert.childName || 'Unknown child'}</p>
                                    <RiskBadge level={alert.riskLevel || alert.mlPrediction} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal === 'child' && (
                <Modal title="Register New Child" onClose={() => setModal(null)}>
                    <form onSubmit={childForm.handleSubmit(onRegisterChild)} className="space-y-4">
                        <FormField label="Full Name" error={childForm.formState.errors.fullName}>
                            <input {...childForm.register('fullName')} placeholder="Child's full name" className={inputCls} />
                        </FormField>
                        <FormField label="Date of Birth" error={childForm.formState.errors.dateOfBirth}>
                            <input type="date" {...childForm.register('dateOfBirth')} className={inputCls} />
                        </FormField>
                        <FormField label="Gender" error={childForm.formState.errors.gender}>
                            <select {...childForm.register('gender')} className={inputCls}>
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </FormField>
                        <FormField label="Parent Phone" error={childForm.formState.errors.parentPhone}>
                            <input {...childForm.register('parentPhone')} placeholder="9876543210" className={inputCls} />
                        </FormField>
                        <FormField label="Mother's Name" error={childForm.formState.errors.motherName}>
                            <input {...childForm.register('motherName')} placeholder="Mother's full name" className={inputCls} />
                        </FormField>
                        <FormField label="Anganwadi UID" error={childForm.formState.errors.anganwadiId}>
                            <input {...childForm.register('anganwadiId')} defaultValue={currentAnganwadiId} placeholder="AW-12345" className={inputCls} />
                        </FormField>
                        <FormField label="Parent Login Password (Optional)" error={childForm.formState.errors.parentPassword}>
                            <input {...childForm.register('parentPassword')} placeholder="Default: password123" className={inputCls} />
                            <p className="text-[10px] text-slate-400 mt-1">If blank, the parent can login with "password123"</p>
                        </FormField>
                        <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                            {submitting ? 'Registering…' : 'Register Child'}
                        </button>
                    </form>
                </Modal>
            )}

            {modal === 'health' && (
                <Modal title="Record Health Data" onClose={() => setModal(null)}>
                    {selectedChild && (
                        <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs text-emerald-700 font-semibold">Recording for: {selectedChild.fullName}</p>
                        </div>
                    )}
                    <form onSubmit={healthForm.handleSubmit(onRecordHealth)} className="space-y-4">
                        {!selectedChild ? (
                            <FormField label="Select Child" error={healthForm.formState.errors.childId}>
                                <select className={inputCls} {...healthForm.register('childId', {
                                    onChange: (e) => {
                                        const summary = children.find(ch => ch.child.id === e.target.value);
                                        setSelectedChild(summary?.child || null);
                                    }
                                })}>
                                    <option value="">Choose a child...</option>
                                    {children.map(({child}) => (
                                        <option key={child.id} value={child.id}>{child.fullName} ({child.motherName})</option>
                                    ))}
                                </select>
                            </FormField>
                        ) : (
                            <div className="hidden">
                                <input type="hidden" {...healthForm.register('childId')} />
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                            <FormField label="Weight (kg)" error={healthForm.formState.errors.weightKg}>
                                <input type="number" step="0.1" {...healthForm.register('weightKg')} placeholder="10.5" className={inputCls} />
                            </FormField>
                            <FormField label="Height (cm)" error={healthForm.formState.errors.heightCm}>
                                <input type="number" step="0.1" {...healthForm.register('heightCm')} placeholder="82" className={inputCls} />
                            </FormField>
                            <FormField label="MUAC (cm)" error={healthForm.formState.errors.muacCm}>
                                <input type="number" step="0.1" {...healthForm.register('muacCm')} placeholder="12.5" className={inputCls} />
                            </FormField>
                        </div>

                        <FormField label="Mother's Education" error={healthForm.formState.errors.motherEducation}>
                            <select {...healthForm.register('motherEducation')} className={inputCls}>
                                <option value="">Select education level</option>
                                <option value="No Education">No Education</option>
                                <option value="Primary">Primary</option>
                                <option value="Secondary">Secondary</option>
                                <option value="Higher">Higher</option>
                            </select>
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Stunting" error={healthForm.formState.errors.stunting}>
                                <select {...healthForm.register('stunting')} className={inputCls}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </FormField>
                            <FormField label="Anemia" error={healthForm.formState.errors.anemia}>
                                <select {...healthForm.register('anemia')} className={inputCls}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </FormField>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <FormField label="Malaria" error={healthForm.formState.errors.malaria}>
                                <select {...healthForm.register('malaria')} className={inputCls}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </FormField>
                            <FormField label="Diarrhea" error={healthForm.formState.errors.diarrhea}>
                                <select {...healthForm.register('diarrhea')} className={inputCls}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </FormField>
                            <FormField label="TB" error={healthForm.formState.errors.tb}>
                                <select {...healthForm.register('tb')} className={inputCls}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </FormField>
                        </div>
                        <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                            {submitting ? 'Recording…' : 'Record & Predict'}
                        </button>
                    </form>
                </Modal>
            )}

            {modal === 'vaccine' && (
                <Modal title="Mark Vaccination" onClose={() => setModal(null)}>
                    {selectedChild && (
                        <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-xs text-amber-700 font-semibold">Marking for: {selectedChild.fullName}</p>
                        </div>
                    )}
                    <form onSubmit={vaccineForm.handleSubmit(onRecordVaccine)} className="space-y-4">
                        {!selectedChild ? (
                            <FormField label="Select Child" error={vaccineForm.formState.errors.childId}>
                                <select className={inputCls} {...vaccineForm.register('childId', {
                                    onChange: (e) => {
                                        const summary = children.find(ch => ch.child.id === e.target.value);
                                        setSelectedChild(summary?.child || null);
                                    }
                                })}>
                                    <option value="">Choose a child...</option>
                                    {children.map(({child}) => (
                                        <option key={child.id} value={child.id}>{child.fullName} ({child.motherName})</option>
                                    ))}
                                </select>
                            </FormField>
                        ) : (
                            <div className="hidden">
                                <input type="hidden" {...vaccineForm.register('childId')} />
                            </div>
                        )}
                        <FormField label="Vaccine Name" error={vaccineForm.formState.errors.vaccineName}>
                            <select {...vaccineForm.register('vaccineName')} className={inputCls}>
                                <option value="">Select vaccine</option>
                                {['BCG', 'Polio OPV', 'Hepatitis B', 'DPT', 'Measles', 'MMR', 'Vitamin A'].map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Status" error={vaccineForm.formState.errors.status}>
                            <select {...vaccineForm.register('status')} className={inputCls}>
                                <option value="">Select status</option>
                                <option value="DONE">Done</option>
                                <option value="MISSED">Missed</option>
                            </select>
                        </FormField>
                        <FormField label="Date" error={vaccineForm.formState.errors.scheduledDate}>
                            <input type="date" {...vaccineForm.register('scheduledDate')} className={inputCls} />
                        </FormField>
                        <button type="submit" disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                            {submitting ? 'Saving…' : 'Save Vaccination'}
                        </button>
                    </form>
                </Modal>
            )}

            {modal === 'pregnancy' && (
                <Modal title="Register Pregnant Woman" onClose={() => setModal(null)}>
                    <form onSubmit={pregnancyForm.handleSubmit(onRegisterPregnancy)} className="space-y-4">
                        <FormField label="Full Name" error={pregnancyForm.formState.errors.fullName}>
                            <input {...pregnancyForm.register('fullName')} className={inputCls} />
                        </FormField>
                        <FormField label="Phone" error={pregnancyForm.formState.errors.phone}>
                            <input {...pregnancyForm.register('phone')} className={inputCls} />
                        </FormField>
                        <div className="grid grid-cols-3 gap-3">
                            <FormField label="Age" error={pregnancyForm.formState.errors.age}>
                                <input type="number" {...pregnancyForm.register('age')} placeholder="25" className={inputCls} />
                            </FormField>
                            <FormField label="Systolic BP" error={pregnancyForm.formState.errors.systolicBP}>
                                <input type="number" {...pregnancyForm.register('systolicBP')} placeholder="120" className={inputCls} />
                            </FormField>
                            <FormField label="Diastolic BP" error={pregnancyForm.formState.errors.diastolicBP}>
                                <input type="number" {...pregnancyForm.register('diastolicBP')} placeholder="80" className={inputCls} />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <FormField label="Blood Sugar" error={pregnancyForm.formState.errors.bloodSugar}>
                                <input type="number" step="0.1" {...pregnancyForm.register('bloodSugar')} placeholder="7.0" className={inputCls} />
                            </FormField>
                            <FormField label="Body Temp" error={pregnancyForm.formState.errors.bodyTemp}>
                                <input type="number" step="0.1" {...pregnancyForm.register('bodyTemp')} placeholder="37.0" className={inputCls} />
                            </FormField>
                            <FormField label="Heart Rate" error={pregnancyForm.formState.errors.heartRate}>
                                <input type="number" {...pregnancyForm.register('heartRate')} placeholder="75" className={inputCls} />
                            </FormField>
                        </div>
                        <FormField label="Anganwadi UID" error={pregnancyForm.formState.errors.anganwadiId}>
                            <input {...pregnancyForm.register('anganwadiId')} defaultValue={currentAnganwadiId} className={inputCls} />
                        </FormField>
                        <button type="submit" disabled={submitting} className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                            {submitting ? 'Registering…' : 'Register Woman'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
