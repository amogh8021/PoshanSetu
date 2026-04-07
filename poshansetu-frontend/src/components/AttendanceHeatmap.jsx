import { useMemo } from 'react';
import { format, eachDayOfInterval, subMonths, getDay, startOfWeek, differenceInWeeks } from 'date-fns';

const CELL = 13;
const GAP = 3;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// Color scheme inspired by GitHub contribution graph
const COLORS = {
    empty: '#ebedf0',       // No data - light grey
    absent: '#fddfdf',      // Absent - soft red  
    leave: '#fff3cd',       // Leave - soft yellow
    present: '#9be9a8',     // Present only - light green
    presentMeal: '#216e39', // Present + Meal - dark green
};

const LEGEND = [
    { label: 'No data', color: COLORS.empty },
    { label: 'Absent', color: COLORS.absent },
    { label: 'Leave', color: COLORS.leave },
    { label: 'Present', color: COLORS.present },
    { label: '+ Meal', color: COLORS.presentMeal },
];

function getColor(record) {
    if (!record) return COLORS.empty;
    if (record.status === 'ABSENT') return COLORS.absent;
    if (record.status === 'LEAVE') return COLORS.leave;
    if (record.status === 'PRESENT' && record.mealEaten) return COLORS.presentMeal;
    if (record.status === 'PRESENT') return COLORS.present;
    return COLORS.empty;
}

function getTooltip(date, record) {
    const dateStr = format(date, 'MMM d, yyyy (EEE)');
    if (!record) return `${dateStr}\nNo record`;
    const status = record.status === 'PRESENT'
        ? (record.mealEaten ? 'Present + Meal' : 'Present')
        : record.status === 'LEAVE' ? 'Leave' : 'Absent';
    return `${dateStr}\n${status}`;
}

// Parse date from API (handles [2026,4,7] array format or ISO string)
function parseAttendanceDate(d) {
    if (!d) return null;
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
    return new Date(d);
}

export default function AttendanceHeatmap({ records = [], months = 3 }) {
    const { days, byDate, weeks, monthLabels } = useMemo(() => {
        const end = new Date();
        const start = subMonths(end, months);
        const allDays = eachDayOfInterval({ start, end });

        // Build map: 'YYYY-MM-DD' -> record
        const map = {};
        records.forEach(r => {
            const d = parseAttendanceDate(r.attendanceDate);
            if (d) map[format(d, 'yyyy-MM-dd')] = r;
        });

        // Calculate weeks for the grid
        const weekStart = startOfWeek(start, { weekStartsOn: 0 }); // Sunday
        const totalWeeks = differenceInWeeks(end, weekStart) + 1;

        // Build month labels
        const labels = [];
        let lastMonth = -1;
        allDays.forEach(day => {
            const m = day.getMonth();
            if (m !== lastMonth) {
                const weekIdx = differenceInWeeks(day, weekStart);
                labels.push({ label: format(day, 'MMM'), x: weekIdx });
                lastMonth = m;
            }
        });

        return { days: allDays, byDate: map, weeks: totalWeeks, monthLabels: labels };
    }, [records, months]);

    const svgWidth = weeks * (CELL + GAP) + 40;
    const svgHeight = 7 * (CELL + GAP) + 30;

    // Stats
    const stats = useMemo(() => {
        let present = 0, meals = 0, absent = 0, total = days.length;
        days.forEach(d => {
            const key = format(d, 'yyyy-MM-dd');
            const r = byDate[key];
            if (r?.status === 'PRESENT') { present++; if (r.mealEaten) meals++; }
            if (r?.status === 'ABSENT') absent++;
        });
        return { present, meals, absent, total };
    }, [days, byDate]);

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700">Attendance & Meals</h3>
                <div className="flex gap-3 text-[10px] text-slate-500">
                    <span><strong className="text-emerald-600">{stats.present}</strong> present</span>
                    <span><strong className="text-green-800">{stats.meals}</strong> meals</span>
                    <span><strong className="text-red-400">{stats.absent}</strong> absent</span>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <svg width={svgWidth} height={svgHeight} className="block">
                    {/* Month labels */}
                    {monthLabels.map((m, i) => (
                        <text key={i} x={m.x * (CELL + GAP) + 35} y={10} fontSize={10} fill="#94a3b8" fontFamily="Inter, sans-serif">
                            {m.label}
                        </text>
                    ))}

                    {/* Day labels */}
                    {DAY_LABELS.map((label, i) => (
                        label && <text key={i} x={0} y={20 + i * (CELL + GAP) + CELL - 2} fontSize={9} fill="#94a3b8" fontFamily="Inter, sans-serif">
                            {label}
                        </text>
                    ))}

                    {/* Cells */}
                    {days.map((day) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const record = byDate[key];
                        const dayOfWeek = getDay(day); // 0=Sun, 6=Sat
                        const weekStart2 = startOfWeek(subMonths(new Date(), months), { weekStartsOn: 0 });
                        const weekIdx = differenceInWeeks(day, weekStart2);
                        const x = weekIdx * (CELL + GAP) + 35;
                        const y = dayOfWeek * (CELL + GAP) + 18;

                        return (
                            <g key={key}>
                                <title>{getTooltip(day, record)}</title>
                                <rect
                                    x={x} y={y}
                                    width={CELL} height={CELL}
                                    rx={2} ry={2}
                                    fill={getColor(record)}
                                    stroke={key === format(new Date(), 'yyyy-MM-dd') ? '#6366f1' : 'transparent'}
                                    strokeWidth={key === format(new Date(), 'yyyy-MM-dd') ? 1.5 : 0}
                                    className="transition-all duration-150 hover:brightness-90 cursor-pointer"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-2 justify-end">
                <span className="text-[10px] text-slate-400">Less</span>
                {LEGEND.map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1" title={label}>
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-[9px] text-slate-400">{label}</span>
                    </div>
                ))}
                <span className="text-[10px] text-slate-400">More</span>
            </div>
        </div>
    );
}
