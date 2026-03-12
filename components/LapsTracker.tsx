import React, { useState, useEffect, useMemo } from 'react';
import { LapsData } from '../types';

interface LapsTrackerProps {
  lapsHistory: LapsData[];
  setLapsHistory: React.Dispatch<React.SetStateAction<LapsData[]>>;
}

// StatCard with color-coding based on Build 2 targets
const StatCard: React.FC<{ title: string; value: number; target?: number }> = ({ title, value, target }) => {
    const isAtTarget = target ? value >= target : false;
    const hasProgress = value > 0 && !isAtTarget;

    return (
        <div className={`rounded-lg p-4 text-center transition-all border ${
            isAtTarget ? 'bg-green-100 border-green-200' : 
            hasProgress ? 'bg-amber-100 border-amber-200' : 
            'bg-slate-100 border-slate-200'
        }`}>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-black text-slate-800">{value}</p>
            {target && <p className="text-[10px] text-slate-400 mt-1 font-medium">Target: {target}</p>}
        </div>
    );
};

const LapsTracker: React.FC<LapsTrackerProps> = ({ lapsHistory, setLapsHistory }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Initialize with all Build 2 Activity fields
    const todayData = useMemo(() => {
        return lapsHistory.find(d => d.date === todayStr) || { 
            date: todayStr, 
            leads: 0, appointments: 0, presentations: 0, sales: 0,
            outreach_emails: 0, voice_drops: 0, li_comments: 0, li_posts: 0, li_dms: 0,
            mrr_current: 0
        };
    }, [lapsHistory, todayStr]);

    const [currentLaps, setCurrentLaps] = useState<LapsData>(todayData);
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
                newHistory[existingIndex] = currentLaps;
                return newHistory;
            } else {
                return [...prevHistory, currentLaps];
            }
        });
        
        // This updated currentLaps object now includes all activity + mrr fields
        setTimeout(() => setSaveStatus('saved'), 300);
        setTimeout(() => setSaveStatus('idle'), 2500);
    };

    const sortedHistory = useMemo(() => {
        return [...lapsHistory]
            .filter(d => d.date !== todayStr)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [lapsHistory, todayStr]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">LAPS & Activity Tracker</h2>
              {sortedHistory.length > 0 && (
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    {showHistory ? 'Hide' : 'View'} History
                </button>
              )}
            </div>
            
            {/* 1. Activity Layer (ABOVE LAPS) */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Outreach Activity</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <StatCard title="Outreach Emails" value={currentLaps.outreach_emails} target={5} />
                    <StatCard title="Voice Drops" value={currentLaps.voice_drops} />
                    <StatCard title="LI Comments" value={currentLaps.li_comments} target={2} />
                    <StatCard title="LI Posts" value={currentLaps.li_posts} />
                    <StatCard title="LI DMs" value={currentLaps.li_dms} target={2} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['outreach_emails', 'voice_drops', 'li_comments', 'li_posts', 'li_dms'].map(field => (
                        <input
                            key={field}
                            type="number"
                            name={field}
                            value={currentLaps[field as keyof LapsData]}
                            onChange={handleInputChange}
                            placeholder="0"
                            className="text-center p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 sm:text-sm font-bold"
                        />
                    ))}
                </div>
            </div>

            <hr className="mb-8 border-slate-100" />

            {/* 2. LAPS Layer */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sales Pipeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {['leads', 'appointments', 'presentations', 'sales'].map(key => (
                        <div key={key}>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1">{key}</label>
                            <input
                                type="number"
                                name={key}
                                value={currentLaps[key as keyof LapsData]}
                                onChange={handleInputChange}
                                className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg font-bold p-3"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. MRR Row (BELOW LAPS) */}
            <div className="mb-8 p-5 bg-slate-900 rounded-xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Current MRR</p>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-light text-slate-500">$</span>
                            <input
                                type="number"
                                name="mrr_current"
                                value={currentLaps.mrr_current}
                                onChange={handleInputChange}
                                className="bg-transparent text-3xl font-bold border-b border-slate-700 w-full focus:outline-none focus:border-blue-500 pb-1"
                            />
                        </div>
                    </div>
                    <div className="flex gap-8 text-right w-full md:w-auto">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">March Target</p>
                            <p className="text-2xl font-black text-green-400">$1,000</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Gap</p>
                            <p className="text-2xl font-black text-blue-400">
                                ${Math.max(0, 1000 - currentLaps.mrr_current).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    className="flex-1 py-4 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    disabled={saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? 'Saving Stats...' : "Update Daily Performance Data"}
                </button>
                {saveStatus === 'saved' && (
                    <p className="text-sm text-green-600 font-bold animate-pulse">✓ Saved</p>
                )}
            </div>

            {showHistory && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Historical Performance</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr className="text-[10px] font-bold text-slate-400 uppercase">
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Emails</th>
                                    <th className="px-6 py-3 text-left">LI DMs</th>
                                    <th className="px-6 py-3 text-left">Sales</th>
                                    <th className="px-6 py-3 text-left">MRR</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {sortedHistory.map(item => (
                                    <tr key={item.date} className="text-sm text-slate-600">
                                        <td className="px-6 py-4 font-bold text-slate-900">{item.date}</td>
                                        <td className="px-6 py-4">{item.outreach_emails || 0}</td>
                                        <td className="px-6 py-4">{item.li_dms || 0}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">{item.sales}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">${item.mrr_current?.toLocaleString() || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LapsTracker;