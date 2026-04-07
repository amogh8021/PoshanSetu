import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyChildren } from '../../api/childApi';
import { useChildData } from '../../hooks/useChildData';
import { StatCard, RiskBadge, GrowthChart, VaccineTimeline, AlertBanner, LoadingSpinner, EmptyState } from '../../components';
import { Baby, Weight, Ruler, Activity, ChevronRight, LogOut, Heart, CalendarCheck } from 'lucide-react';
import { getWeeklySummary } from '../../api/nutritionApi';
import { getAttendanceHistory } from '../../api/attendanceApi';
import AttendanceHeatmap from '../../components/AttendanceHeatmap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, differenceInMonths } from 'date-fns';

const TABS = ['Growth', 'Vaccination', 'Nutrition', 'Attendance'];
 
const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
    return new Date(d);
};

export default function ParentDashboard() {
    const { user, logout } = useAuth();
    const [children, setChildren] = useState([]);
    const [loadingChildren, setLoadingChildren] = useState(true);
    const [selectedChild, setSelectedChild] = useState(null);
    const [activeTab, setActiveTab] = useState('Growth');
    const [nutrition, setNutrition] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { childData, latestHealth, upcomingVaccines, isLoading } = useChildData(selectedChild?.id);

    useEffect(() => {
        if (!user?.id) {
            console.warn("ParentDashboard: No user ID found", user);
            setLoadingChildren(false);
            return;
        }
        console.log("ParentDashboard: Fetching children for parentId:", user.id);
        getMyChildren(user.id)
            .then((r) => {
                const list = r.data?.data || [];
                console.log("ParentDashboard: Found children:", list.length);
                setChildren(list);
                if (list.length) setSelectedChild(list[0]);
            })
            .catch(err => console.error("ParentDashboard: Failed to fetch children", err))
            .finally(() => setLoadingChildren(false));
    }, [user]);

    useEffect(() => {
        if (!selectedChild?.id) return;
        getWeeklySummary(selectedChild.id).then((r) => setNutrition(r.data?.data || []));
        getAttendanceHistory(selectedChild.id)
            .then((r) => setAttendanceHistory(r.data?.data || []))
            .catch(() => setAttendanceHistory([]));
    }, [selectedChild]);

    const isModerateSevere = ['Moderate', 'MODERATE', 'Severe', 'SEVERE'].includes(latestHealth?.mlPrediction);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
                        <div className="w-5 h-0.5 bg-slate-600 mb-1" />
                        <div className="w-5 h-0.5 bg-slate-600 mb-1" />
                        <div className="w-5 h-0.5 bg-slate-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Heart size={16} className="text-white" fill="white" />
                        </div>
                        <span className="font-bold text-slate-800">PoshanSetu</span>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut size={15} /> Logout
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 bg-white border-r border-slate-100 p-4 gap-1 fixed md:relative inset-0 md:inset-auto z-10 md:z-auto shadow-xl md:shadow-none`}>
                    <div className="flex justify-between items-center mb-3 md:hidden">
                        <p className="text-sm font-semibold text-slate-700">My Children</p>
                        <button onClick={() => setSidebarOpen(false)} className="text-slate-400 text-xl">×</button>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 hidden md:block">My Children</p>
                    {loadingChildren ? (
                        <LoadingSpinner size="sm" />
                    ) : !children.length ? (
                        <EmptyState icon={Baby} title="No children found" subtitle="Contact your worker to register your child." />
                    ) : (
                        children.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => { setSelectedChild(c); setSidebarOpen(false); }}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${selectedChild?.id === c.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${c.gender === 'FEMALE' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {c.fullName?.[0]}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{c.fullName}</p>
                                        <p className="text-xs text-slate-400">{c.gender}</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-slate-300" />
                            </button>
                        ))
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {!selectedChild ? (
                        <EmptyState icon={Baby} title="Select a child" subtitle="Pick a child from the left panel to view their health data." />
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-5">
                            {/* Child header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedChild.fullName}</h2>
                                    <p className="text-sm text-slate-400">
                                        {selectedChild.dateOfBirth ? `${differenceInMonths(new Date(), parseDate(selectedChild.dateOfBirth))} months old` : 'Age unknown'}
                                    </p>
                                </div>
                                {latestHealth && <RiskBadge level={latestHealth.mlPrediction} />}
                            </div>

                            {isModerateSevere && (
                                <AlertBanner type="danger" message="⚠️ This child is flagged as at risk. Please visit your Anganwadi centre immediately." />
                            )}

                            {/* Tabs */}
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {isLoading ? <LoadingSpinner message="Loading health data..." /> : (
                                <>
                                    {/* Growth Tab */}
                                    {activeTab === 'Growth' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <StatCard title="Weight" value={latestHealth?.weightKg ? `${latestHealth.weightKg} kg` : '—'} icon={Weight} color="indigo" />
                                                <StatCard title="Height" value={latestHealth?.heightCm ? `${latestHealth.heightCm} cm` : '—'} icon={Ruler} color="emerald" />
                                                <StatCard title="MUAC" value={latestHealth?.muacCm ? `${latestHealth.muacCm} cm` : '—'} icon={Activity} color="amber" />
                                                <StatCard title="Records" value={childData?.length || 0} subtitle="total visits" icon={Baby} color="blue" />
                                            </div>
                                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                                <h3 className="text-sm font-semibold text-slate-600 mb-4">Growth Chart (last 6 months)</h3>
                                                <GrowthChart records={childData?.slice(-6) || []} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Vaccination Tab */}
                                    {activeTab === 'Vaccination' && (
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-semibold text-slate-600">Vaccination History</h3>
                                                <div className="flex gap-3">
                                                    <span className="text-xs text-emerald-600 font-medium">✔ {upcomingVaccines.filter(v => v.status === 'DONE').length} Done</span>
                                                    <span className="text-xs text-slate-400 font-medium">○ {upcomingVaccines.filter(v => v.status === 'PENDING').length} Pending</span>
                                                </div>
                                            </div>
                                            <VaccineTimeline vaccinations={upcomingVaccines} />
                                        </div>
                                    )}

                                    {/* Nutrition Tab */}
                                    {activeTab === 'Nutrition' && (
                                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                            <h3 className="text-sm font-semibold text-slate-600 mb-4">Weekly Nutrition Summary</h3>
                                            {nutrition.length ? (
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <BarChart data={nutrition}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                                        <YAxis tick={{ fontSize: 11 }} />
                                                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                                                        <Bar dataKey="caloriesKcal" fill="#6366f1" name="Calories (kcal)" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="proteinG" fill="#10b981" name="Protein (g)" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="ironMg" fill="#f59e0b" name="Iron (mg)" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <EmptyState icon={Activity} title="No nutrition data" subtitle="No nutrition logs found for this child." />
                                            )}
                                        </div>
                                    )}

                                    {/* Attendance Tab */}
                                    {activeTab === 'Attendance' && (
                                        <AttendanceHeatmap records={attendanceHistory} months={3} />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
