import React, { useState } from 'react';
import type { AccountabilityData, LapsData } from '../types';
import { DownloadIcon, ChevronDownIcon, TargetIcon, PieChartIcon } from 'lucide-react';

interface Props {
  accountabilityHistory: AccountabilityData[];
  setAccountabilityHistory: React.Dispatch<React.SetStateAction<AccountabilityData[]>>;
  lapsHistory: LapsData[];
}

const AccountabilityTracker: React.FC<Props> = ({ accountabilityHistory, setAccountabilityHistory, lapsHistory }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showReports, setShowReports] = useState(false);

  const getWeekDates = (offset = 0) => {
    const weekDates = [];
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const toISODateString = (date: Date) => date.toISOString().split('T')[0];
  const toFriendlyDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  const weekDates = getWeekDates(weekOffset);
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const activities = ['appointment', 'spokeToPerson', 'taughtSomeone', 'madeOffer'];
  const activityLabels: Record<string, string> = { appointment: 'Booked Appt', spokeToPerson: 'Spoke to 1 Person', taughtSomeone: 'Taught Someone', madeOffer: 'Made an Offer' };

  const handleCheckboxChange = (date: string, activity: string, checked: boolean) => {
    setAccountabilityHistory(prevHistory => {
      const entryIndex = prevHistory.findIndex(e => e.date === date);
      if (entryIndex > -1) {
        const newHistory = [...prevHistory];
        newHistory[entryIndex] = { ...newHistory[entryIndex], [activity]: checked };
        return newHistory;
      } else {
        const newEntry = { date, appointment: false, spokeToPerson: false, taughtSomeone: false, madeOffer: false, [activity]: checked };
        return [...prevHistory, newEntry];
      }
    });
  };

  const weekData = weekDates.map(date => {
    const dateStr = toISODateString(date);
    return accountabilityHistory.find(entry => entry.date === dateStr) || { date: dateStr, appointment: false, spokeToPerson: false, taughtSomeone: false, madeOffer: false };
  });

  const totals = activities.reduce((acc: any, activity) => { 
      acc[activity] = weekData.filter(day => (day as any)[activity]).length; 
      return acc; 
  }, {});
  
  const weekRange = `Week of ${toFriendlyDate(weekDates[0])} - ${toFriendlyDate(weekDates[4])}`;

  const handleFinalizeWeek = () => {
    if (window.confirm(`Finalize the week of ${weekRange}?`)) {
      const finalizedWeeks = JSON.parse(localStorage.getItem('finalized-weeks') || '[]');
      const weekKey = `${weekDates[0].getFullYear()}-W${Math.ceil(weekDates[0].getDate() / 7)}`;
      if (!finalizedWeeks.includes(weekKey)) { finalizedWeeks.push(weekKey); localStorage.setItem('finalized-weeks', JSON.stringify(finalizedWeeks)); }
      alert(`Week finalized! Data for ${weekRange} has been saved.`);
    }
  };

  const exportAccountabilityData = () => {
      if(accountabilityHistory.length === 0) return alert("No data to export");
      const headers = Object.keys(accountabilityHistory[0]).join(',');
      const rows = accountabilityHistory.map(row => Object.values(row).join(',')).join('\n');
      const blob = new Blob([[headers, rows].join('\n')], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `accountability-data.csv`;
      link.click();
  }

  const isCurrentWeek = weekOffset === 0;
  const finalizedWeeks = JSON.parse(localStorage.getItem('finalized-weeks') || '[]');
  const weekKey = `${weekDates[0].getFullYear()}-W${Math.ceil(weekDates[0].getDate() / 7)}`;
  const isWeekFinalized = finalizedWeeks.includes(weekKey);

  // --- REPORTS DATA GENERATION ---
  const getWeeklyLaps = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    return lapsHistory.filter(d => d.date >= startOfWeekStr && d.date <= todayStr).reduce((acc, curr) => ({ leads: acc.leads + curr.leads, appointments: acc.appointments + curr.appointments, presentations: acc.presentations + curr.presentations, sales: acc.sales + curr.sales }), { leads: 0, appointments: 0, presentations: 0, sales: 0 });
  };
  
  const weeklyLaps = getWeeklyLaps();
  const leadToApptRate = weeklyLaps.leads > 0 ? ((weeklyLaps.appointments / weeklyLaps.leads) * 100).toFixed(1) : '0.0';
  const apptToPresRate = weeklyLaps.appointments > 0 ? ((weeklyLaps.presentations / weeklyLaps.appointments) * 100).toFixed(1) : '0.0';
  const presToSaleRate = weeklyLaps.presentations > 0 ? ((weeklyLaps.sales / weeklyLaps.presentations) * 100).toFixed(1) : '0.0';

  const getHeatmapData = () => {
    const today = new Date();
    const year = today.getFullYear(); const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const offset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
    const heatmap = Array(offset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const entry = accountabilityHistory.find(d => d.date === dateStr);
      heatmap.push(entry ? { date: i, score: Object.values(entry).filter(v => v === true).length } : { date: i, score: 0 });
    }
    return heatmap;
  };
  const heatmapData = getHeatmapData();
  const getColorForScore = (score: number) => { if (score >= 4) return 'bg-green-600'; if (score === 3) return 'bg-green-500'; if (score === 2) return 'bg-amber-400'; if (score === 1) return 'bg-amber-200'; return 'bg-slate-100'; };

  return (
    <div className="space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg"><TargetIcon className="w-5 h-5 text-indigo-600" /></div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Accountability Process</h2>
              </div>
              <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">{weekRange}</p>
                  {isWeekFinalized && <p className="text-xs text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-md font-bold uppercase tracking-wider">✓ Finalized</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">← Prev</button>
              <button onClick={() => setWeekOffset(weekOffset + 1)} disabled={weekOffset >= 0} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Next →</button>
              {accountabilityHistory.length > 0 && <button onClick={exportAccountabilityData} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all"><DownloadIcon className="w-3.5 h-3.5" />CSV</button>}
              {isCurrentWeek && !isWeekFinalized && <button onClick={handleFinalizeWeek} className="px-5 py-2 text-xs font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all shadow-sm">Finalize Week</button>}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50/50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left font-black text-indigo-900 tracking-wider uppercase text-xs">Day</th>
                  {activities.map(activity => (<th key={activity} className="p-4 text-center font-black text-indigo-900 tracking-wider uppercase text-xs">{activityLabels[activity]}</th>))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {weekDays.map((day, index) => {
                  const dateStr = toISODateString(weekDates[index]);
                  const dayData = weekData[index] as any;
                  return (
                    <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{day}</td>
                      {activities.map(activity => (
                        <td key={activity} className="p-4 text-center">
                          <input type="checkbox" className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" checked={!!dayData[activity]} onChange={e => handleCheckboxChange(dateStr, activity, e.target.checked)} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-indigo-600 text-white font-black">
                <tr>
                  <td className="p-4 text-left uppercase tracking-widest text-xs">Weekly Total</td>
                  {activities.map(activity => (<td key={activity} className="p-4 text-center text-lg">{totals[activity]}</td>))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* PERFORMANCE REPORTS SECTION */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
            <button onClick={() => setShowReports(!showReports)} className="w-full flex justify-between items-center text-left focus:outline-none group">
              <span className="flex items-center gap-3 text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-blue-50 transition-colors"><PieChartIcon className="w-5 h-5 text-emerald-600 group-hover:text-blue-600 transition-colors" /></div>
                  Performance Reports
              </span>
              <ChevronDownIcon className={`w-5 h-5 text-slate-400 group-hover:text-blue-600 transform transition-all duration-300 ${showReports ? 'rotate-180' : ''}`} />
            </button>
            
            {showReports && (
              <div className="mt-8 border-t border-slate-100 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <section className="mb-10">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">This Week's Conversion Funnel</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                    <div className="flex-1 w-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Leads</p><p className="text-4xl font-black text-slate-800">{weeklyLaps.leads}</p></div>
                    <div className="flex flex-col items-center"><p className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-1">{leadToApptRate}%</p><div className="w-8 h-px bg-slate-300 md:hidden"></div></div>
                    <div className="flex-1 w-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Appts</p><p className="text-4xl font-black text-slate-800">{weeklyLaps.appointments}</p></div>
                    <div className="flex flex-col items-center"><p className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-1">{apptToPresRate}%</p><div className="w-8 h-px bg-slate-300 md:hidden"></div></div>
                    <div className="flex-1 w-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Pres</p><p className="text-4xl font-black text-slate-800">{weeklyLaps.presentations}</p></div>
                    <div className="flex flex-col items-center"><p className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-1">{presToSaleRate}%</p><div className="w-8 h-px bg-slate-300 md:hidden"></div></div>
                    <div className="flex-1 w-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm border-b-4 border-b-emerald-500"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Sales</p><p className="text-4xl font-black text-emerald-600">{weeklyLaps.sales}</p></div>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-t border-slate-100 pt-8">30-Day Accountability Heatmap</h3>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                  <div className="grid grid-cols-7 gap-2">
                    {heatmapData.map((day: any, index: number) => (day ? (<div key={index} title={`${day.score} activities on day ${day.date}`} className={`w-full aspect-square rounded-xl ${getColorForScore(day.score)} flex items-center justify-center font-bold shadow-sm transition-transform hover:scale-105 ${day.score >= 3 ? 'text-white' : 'text-slate-600'}`}>{day.date}</div>) : (<div key={index} className="w-full aspect-square bg-transparent"></div>)))}
                  </div>
                </section>
              </div>
            )}
        </div>
    </div>
  );
};

export default AccountabilityTracker;