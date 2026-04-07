import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import { StatCard, RiskBadge, LoadingSpinner } from '../../components';
import { getHighRisk } from '../../api/pregnancyApi';
import { getFullReport } from '../../api/adminApi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Baby, AlertTriangle, Syringe, Heart, LogOut, Download } from 'lucide-react';

const PIE_COLORS = { DONE: '#10b981', PENDING: '#94a3b8', MISSED: '#ef4444' };

function SortableTable({ data }) {
    const [sortKey, setSortKey] = useState('malnutritionPct');
    const [asc, setAsc] = useState(false);

    const sorted = [...data].sort((a, b) =>
        asc ? (a[sortKey] > b[sortKey] ? 1 : -1) : (a[sortKey] < b[sortKey] ? 1 : -1)
    );

    const cols = [
        { key: 'anganwadiId', label: 'Anganwadi ID' },
        { key: 'totalChildren', label: 'Total Children' },
        { key: 'malnutritionPct', label: 'Malnutrition %' },
        { key: 'vaccinationCompliancePct', label: 'Compliance %' },
        { key: 'highRiskPregnancies', label: 'Risk Pregnancies' },
    ];

    const handleSort = (k) => { setSortKey(k); setAsc(sortKey === k ? !asc : false); };

    const exportCsv = () => {
        const header = cols.map(c => c.label).join(',');
        const rows = sorted.map(r => cols.map(c => r[c.key] ?? '').join(','));
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'poshansetu_report.csv'; a.click();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700">Village Comparison</h3>
                <button onClick={exportCsv} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg">
                    <Download size={12} /> Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            {cols.map(c => (
                                <th key={c.key} onClick={() => handleSort(c.key)}
                                    className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-indigo-600">
                                    {c.label} {sortKey === c.key ? (asc ? '↑' : '↓') : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sorted.map((row, i) => (
                            <tr key={i} className={`hover:bg-slate-50 transition-colors ${row.malnutritionPct > 30 ? 'bg-amber-50' : ''}`}>
                                {cols.map(c => (
                                    <td key={c.key} className="px-3 py-2.5 text-slate-700">{row[c.key] ?? '—'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!sorted.length && <p className="text-center text-sm text-slate-400 py-8">No village data available</p>}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { logout } = useAuth();
    const { malnutritionData, complianceData, isLoading } = useAdminStats();
    const [highRiskPregnancies, setHighRiskPregnancies] = useState([]);
    const [report, setReport] = useState([]);

    useEffect(() => {
        getHighRisk().then((r) => setHighRiskPregnancies(r.data?.data || [])).catch(() => { });
        getFullReport().then((r) => setReport(r.data?.data || [])).catch(() => { });
    }, []);

    const pieData = complianceData
        ? Object.entries(complianceData).map(([name, value]) => ({ name, value }))
        : [];

    const totalChildren = (Array.isArray(report) ? report : []).reduce((s, r) => s + (r.totalChildren || 0), 0);
    const totalHighRisk = (Array.isArray(highRiskPregnancies) ? highRiskPregnancies : []).length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Heart size={16} className="text-white" fill="white" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">PoshanSetu</span>
                    <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
                </div>
                <button onClick={logout} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut size={15} /> Logout
                </button>
            </header>

            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Registered Children" value={totalChildren || '—'} icon={Baby} color="indigo" />
                    <StatCard title="Severely Malnourished" value={malnutritionData.filter(d => d.severe > 0).length} subtitle="anganwadis affected" icon={AlertTriangle} color="red" />
                    <StatCard title="Vaccine Compliance" value={complianceData?.DONE !== undefined ? `${Math.round((complianceData.DONE / ((complianceData.DONE || 0) + (complianceData.PENDING || 0) + (complianceData.MISSED || 0))) * 100)}%` : '—'} icon={Syringe} color="emerald" />
                    <StatCard title="High Risk Pregnancies" value={totalHighRisk} icon={Heart} color="amber" />
                </div>

                {isLoading ? <LoadingSpinner message="Loading dashboard data..." /> : (
                    <>
                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Malnutrition Bar Chart */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 mb-4">Malnutrition by Anganwadi</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={malnutritionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="anganwadiId" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="normal" name="Normal" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="moderate" name="Moderate" fill="#f59e0b" stackId="a" />
                                        <Bar dataKey="severe" name="Severe" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Compliance Pie Chart */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 mb-4">Vaccination Compliance</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false} dataKey="value">
                                            {pieData.map((entry) => (
                                                <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Village Comparison Table */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <SortableTable data={report} />
                        </div>

                        {/* High Risk Pregnancies */}
                        {highRiskPregnancies.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Heart size={15} className="text-red-500" fill="currentColor" /> High Risk Pregnancies
                                </h3>
                                <div className="space-y-2">
                                    {highRiskPregnancies.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{p.motherName || p.userName || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400">Trimester {p.trimester} · Last assessed: {p.lastAssessedDate || '—'}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500">{p.workerName || '—'}</span>
                                                <RiskBadge level={p.riskLevel} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
