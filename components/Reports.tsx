import React from 'react';
import { LapsData, AccountabilityData } from '../types';

interface ReportsProps {
  lapsHistory: LapsData[];
  accountabilityHistory: AccountabilityData[];
}

const Reports: React.FC<ReportsProps> = ({ lapsHistory, accountabilityHistory }) => {

  // --- LAPS Conversion Funnel ---
  const getWeeklyLaps = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return lapsHistory
      .filter(d => d.date >= startOfWeekStr && d.date <= todayStr)
      .reduce((acc, curr) => ({
          leads: acc.leads + curr.leads,
          appointments: acc.appointments + curr.appointments,
          presentations: acc.presentations + curr.presentations,
          sales: acc.sales + curr.sales,
      }), { leads: 0, appointments: 0, presentations: 0, sales: 0 });
  };
  
  const weeklyLaps = getWeeklyLaps();
  const leadToApptRate = weeklyLaps.leads > 0 ? ((weeklyLaps.appointments / weeklyLaps.leads) * 100).toFixed(1) : '0.0';
  const apptToPresRate = weeklyLaps.appointments > 0 ? ((weeklyLaps.presentations / weeklyLaps.appointments) * 100).toFixed(1) : '0.0';
  const presToSaleRate = weeklyLaps.presentations > 0 ? ((weeklyLaps.sales / weeklyLaps.presentations) * 100).toFixed(1) : '0.0';

  // --- Monthly Trends ---
  const getMonthlyTrends = () => {
    const trends: { [month: string]: LapsData } = {};
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        const monthData = lapsHistory
            .filter(d => d.date.startsWith(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`))
            .reduce((acc, curr) => ({
                date: acc.date,
                leads: acc.leads + curr.leads,
                appointments: acc.appointments + curr.appointments,
                presentations: acc.presentations + curr.presentations,
                sales: acc.sales + curr.sales,
            }), { date: monthKey, leads: 0, appointments: 0, presentations: 0, sales: 0 });

        trends[monthKey] = monthData;
    }
    return Object.values(trends).reverse();
  };
  const monthlyTrends = getMonthlyTrends();

  // --- Accountability Heatmap ---
  const getHeatmapData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const offset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Mon, 1=Tues...

    const heatmap = Array(offset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const entry = accountabilityHistory.find(d => d.date === dateStr);
        if (entry) {
            const score = Object.values(entry).filter(v => v === true).length;
            heatmap.push({ date: i, score });
        } else {
            heatmap.push({ date: i, score: 0 });
        }
    }
    return heatmap;
  };
  const heatmapData = getHeatmapData();
  const getColorForScore = (score: number) => {
    if (score >= 4) return 'bg-green-600';
    if (score === 3) return 'bg-green-500';
    if (score === 2) return 'bg-yellow-400';
    if (score === 1) return 'bg-yellow-300';
    return 'bg-slate-200';
  };


  return (
    <div className="space-y-12">
      
      {/* LAPS Conversion Funnel */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4">This Week's LAPS Conversion Funnel</h3>
        <div className="flex flex-col md:flex-row items-center justify-around gap-2 text-center flex-wrap">
          
          <div className="p-4 rounded-lg bg-slate-100 min-w-[100px]">
            <p className="text-sm text-slate-500">Leads</p>
            <p className="text-3xl font-bold">{weeklyLaps.leads}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-2xl font-semibold text-slate-400">→</div>
            <p className="text-lg font-bold text-blue-600">{leadToApptRate}%</p>
            <p className="text-xs text-slate-500 -mt-1">conversion</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-100 min-w-[100px]">
            <p className="text-sm text-slate-500">Appointments</p>
            <p className="text-3xl font-bold">{weeklyLaps.appointments}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-2xl font-semibold text-slate-400">→</div>
            <p className="text-lg font-bold text-blue-600">{apptToPresRate}%</p>
            <p className="text-xs text-slate-500 -mt-1">conversion</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-100 min-w-[100px]">
            <p className="text-sm text-slate-500">Presentations</p>
            <p className="text-3xl font-bold">{weeklyLaps.presentations}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-2xl font-semibold text-slate-400">→</div>
            <p className="text-lg font-bold text-blue-600">{presToSaleRate}%</p>
            <p className="text-xs text-slate-500 -mt-1">conversion</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-100 min-w-[100px]">
            <p className="text-sm text-slate-500">Sales</p>
            <p className="text-3xl font-bold">{weeklyLaps.sales}</p>
          </div>

        </div>
      </section>

      {/* Monthly Trends */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Monthly LAPS Trends</h3>
        <div className="space-y-4">
          {monthlyTrends.map(month => (
            <div key={month.date}>
              <h4 className="font-semibold text-slate-600 mb-2">{month.date}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                {Object.entries(month).map(([key, value]) => {
                  if (key === 'date') return null;
                  const maxVal = Math.max(...monthlyTrends.flatMap(m => Object.values(m).filter(v => typeof v === 'number'))) || 1;
                  const width = (Number(value) / maxVal) * 100;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-28 capitalize shrink-0">{key}</span>
                      <div className="w-full bg-slate-200 rounded-full h-5">
                          <div className="bg-blue-500 h-5 rounded-full text-white text-xs flex items-center justify-end pr-2" style={{ width: `${width}%` }}>
                              <span className="font-bold">{value as number}</span>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accountability Heatmap */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4">This Month's Accountability Heatmap</h3>
         <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((day, index) => (
                day ? (
                    <div key={index} title={`${day.score} activities on day ${day.date}`} className={`w-full aspect-square rounded ${getColorForScore(day.score)} flex items-center justify-center text-white font-bold`}>
                        {day.date}
                    </div>
                ) : (
                    <div key={index}></div>
                )
            ))}
        </div>
         <div className="flex justify-end items-center gap-4 mt-2 text-xs">
            <span>Less</span>
            <div className="w-4 h-4 rounded bg-slate-200"></div>
            <div className="w-4 h-4 rounded bg-yellow-300"></div>
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span>More</span>
        </div>
      </section>

    </div>
  );
};

export default Reports;