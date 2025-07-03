import React, { useState, useEffect, useMemo } from 'react';
import { LapsData } from '../types';

interface LapsTrackerProps {
  lapsHistory: LapsData[];
  setLapsHistory: React.Dispatch<React.SetStateAction<LapsData[]>>;
}

const StatCard: React.FC<{ title: string; value: number | string; }> = ({ title, value }) => (
    <div className="bg-slate-100 rounded-lg p-4 text-center">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
);

const LapsTracker: React.FC<LapsTrackerProps> = ({ lapsHistory, setLapsHistory }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const todayData = useMemo(() => {
        return lapsHistory.find(d => d.date === todayStr) || { date: todayStr, leads: 0, appointments: 0, presentations: 0, sales: 0 };
    }, [lapsHistory, todayStr]);

    const [currentLaps, setCurrentLaps] = useState<Omit<LapsData, 'date'>>(todayData);
    const [showHistory, setShowHistory] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setCurrentLaps(todayData);
    }, [todayData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentLaps(prev => ({ ...prev, [name]: Number(value) < 0 ? 0 : Number(value) }));
        setSaveStatus('idle');
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setLapsHistory(prevHistory => {
            const existingIndex = prevHistory.findIndex(d => d.date === todayStr);
            if (existingIndex > -1) {
                const newHistory = [...prevHistory];
                newHistory[existingIndex] = { ...currentLaps, date: todayStr };
                return newHistory;
            } else {
                return [...prevHistory, { ...currentLaps, date: todayStr }];
            }
        });
        setTimeout(() => setSaveStatus('saved'), 300);
        setTimeout(() => setSaveStatus('idle'), 2500);
    };

    const getTotals = (startDate: Date, endDate: Date) => {
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        return lapsHistory
            .filter(d => d.date >= startStr && d.date <= endStr)
            .reduce((acc, curr) => ({
                leads: acc.leads + curr.leads,
                appointments: acc.appointments + curr.appointments,
                presentations: acc.presentations + curr.presentations,
                sales: acc.sales + curr.sales,
            }), { leads: 0, appointments: 0, presentations: 0, sales: 0 });
    };

    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust for Sunday

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const weeklyTotals = useMemo(() => getTotals(startOfWeek, today), [lapsHistory, startOfWeek, today]);
    const monthlyTotals = useMemo(() => getTotals(startOfMonth, today), [lapsHistory, startOfMonth, today]);

    const sortedHistory = useMemo(() => {
        return [...lapsHistory]
            .filter(d => d.date !== todayStr)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [lapsHistory, todayStr]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800">LAPS Tracker</h2>
              {sortedHistory.length > 0 && (
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-3 py-1 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                    {showHistory ? 'Hide' : 'Show'} History
                </button>
              )}
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Today's Laps ({todayStr})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {['leads', 'appointments', 'presentations', 'sales'].map(key => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-slate-600 capitalize">{key}</label>
                            <input
                                type="number"
                                name={key}
                                id={key}
                                value={currentLaps[key as keyof typeof currentLaps]}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                                min="0"
                            />
                        </div>
                    ))}
                </div>
                 <div className="flex items-center gap-4 h-9">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? 'Saving...' : "Update Today's LAPS"}
                    </button>
                    {saveStatus === 'saved' && (
                        <p className="text-sm text-green-600 font-medium">Saved successfully!</p>
                    )}
                </div>
            </div>

            {showHistory && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Performance History</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Leads</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Appointments</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Presentations</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sales</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {sortedHistory.map(item => (
                                    <tr key={item.date}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.leads}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.appointments}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.presentations}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.sales}</td>
                                    </tr>
                                ))}
                                {sortedHistory.length === 0 && (
                                     <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">No past history yet. Your recorded LAPS will appear here on subsequent days.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">This Week's Totals</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Leads" value={weeklyTotals.leads} />
                        <StatCard title="Appointments" value={weeklyTotals.appointments} />
                        <StatCard title="Presentations" value={weeklyTotals.presentations} />
                        <StatCard title="Sales" value={weeklyTotals.sales} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">This Month's Totals</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="Leads" value={monthlyTotals.leads} />
                        <StatCard title="Appointments" value={monthlyTotals.appointments} />
                        <StatCard title="Presentations" value={monthlyTotals.presentations} />
                        <StatCard title="Sales" value={monthlyTotals.sales} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LapsTracker;