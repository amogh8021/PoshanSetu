import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export function GrowthChart({ records = [] }) {
    const parseDate = (d) => {
        if (!d) return null;
        if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
        return new Date(d);
    };

    const data = records.map((r) => ({
        date: format(parseDate(r.recordedAt), 'MMM d'),
        weight: r.weightKg,
        height: r.heightCm,
    }));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis yAxisId="weight" orientation="left" tick={{ fontSize: 11 }} stroke="#94a3b8" unit="kg" />
                    <YAxis yAxisId="height" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" unit="cm" />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <ReferenceLine yAxisId="weight" y={10} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'WHO', fontSize: 10, fill: '#f59e0b' }} />
                    <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Weight (kg)" />
                    <Line yAxisId="height" type="monotone" dataKey="height" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Height (cm)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
