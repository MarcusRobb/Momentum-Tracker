import React, { useState, useEffect, useMemo } from 'react';
import type { LapsData, SaleDetail } from '../types';
import { ChevronDownIcon, DownloadIcon, TargetIcon, TrendingUpIcon, ActivityIcon, DollarSignIcon } from 'lucide-react';

interface Props {
  lapsHistory: LapsData[];
  setLapsHistory: React.Dispatch<React.SetStateAction<LapsData[]>>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const LapsTracker: React.FC<Props> = ({ lapsHistory, setLapsHistory }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayData = useMemo(() => lapsHistory.find(d => d.date === todayStr) || {
    date: todayStr, leads: 0, appointments: 0, presentations: 0, sales: 0,
    outreach_emails: 0, voice_drops: 0, li_comments: 0, li_posts: 0, li_dms: 0,
    mrr_current: 0, salesDetails: []
  }, [lapsHistory, todayStr]);

  const [currentLaps, setCurrentLaps] = useState<any>(todayData);
  const [showHistory, setShowHistory] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  const [mrrTarget, setMrrTarget] = useState(() => {
    const saved = localStorage.getItem('ptp-mrr-target');
    return saved ? Number(saved) : 1000;
  });

  useEffect(() => {
    localStorage.setItem('ptp-mrr-target', mrrTarget.toString());
  }, [mrrTarget]);

  const DAILY_TARGETS = {
    outreach_emails: 5,
    li_comments: 2,
    li_dms: 2,
    li_posts: 1
  };

  useEffect(() => { setCurrentLaps(todayData); }, [todayData]);

  // --- SALES DETAILS SYNC ---
  // Keeps salesDetails rows in sync with the sales count at all times
  const syncedSalesDetails: SaleDetail[] = useMemo(() => {
    const count = currentLaps.sales || 0;
    const existing: SaleDetail[] = currentLaps.salesDetails || [];
    if (existing.length === count) return existing;
    if (existing.length < count) {
      const toAdd = Array.from({ length: count - existing.length }, () => ({
        id: generateId(), setupFee: 0, mrr: 0
      }));
      return [...existing, ...toAdd];
    }
    return existing.slice(0, count);
  }, [currentLaps.sales, currentLaps.salesDetails]);

  const totalSetupToday = syncedSalesDetails.reduce((acc, s) => acc + (s.setupFee || 0), 0);
  const totalMrrAddedToday = syncedSalesDetails.reduce((acc, s) => acc + (s.mrr || 0), 0);

  const handleSaleDetailChange = (id: string, field: 'setupFee' | 'mrr', value: number) => {
    const updated = syncedSalesDetails.map(s => s.id === id ? { ...s, [field]: Math.max(0, value) } : s);
    setCurrentLaps((prev: any) => ({ ...prev, salesDetails: updated }));
  };

  // --- CORE INPUT HANDLER ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value) < 0 ? 0 : Number(value);

    setCurrentLaps((prev: any) => {
      const updated = { ...prev, [name]: numValue };
      const outreachKeys = ['outreach_emails', 'voice_drops', 'li_comments', 'li_posts', 'li_dms'];
      if (outreachKeys.includes(name)) {
        updated.leads = (updated.outreach_emails || 0) +
          (updated.voice_drops || 0) +
          (updated.li_comments || 0) +
          (updated.li_posts || 0) +
          (updated.li_dms || 0);
      }
      // Sync salesDetails rows when sales count changes
      if (name === 'sales') {
        const count = numValue;
        const existing: SaleDetail[] = prev.salesDetails || [];
        if (existing.length < count) {
          updated.salesDetails = [...existing, ...Array.from({ length: count - existing.length }, () => ({
            id: generateId(), setupFee: 0, mrr: 0
          }))];
        } else {
          updated.salesDetails = existing.slice(0, count);
        }
      }
      return updated;
    });
    setSaveStatus('idle');
  };

  // --- SAVE ---
  const handleSave = () => {
    setSaveStatus('saving');
    const dataToSave = {
      ...currentLaps,
      date: todayStr,
      salesDetails: syncedSalesDetails,
    };
    setLapsHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(d => d.date === todayStr);
      if (existingIndex > -1) {
        const newHistory = [...prevHistory];
        newHistory[existingIndex] = dataToSave;
        return newHistory;
      }
      return [...prevHistory, dataToSave];
    });
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  // --- WEEKLY / MONTHLY TOTALS (now include MRR + Setup) ---
  const getWeeklyTotal = () => {
    const today = new Date(); const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    return lapsHistory
      .filter(d => d.date >= startOfWeek.toISOString().split('T')[0] && d.date <= todayStr)
      .reduce((acc, curr) => ({
        leads: acc.leads + curr.leads,
        appointments: acc.appointments + curr.appointments,
        presentations: acc.presentations + curr.presentations,
        sales: acc.sales + curr.sales,
        mrr: acc.mrr + (curr.salesDetails || []).reduce((a, s) => a + (s.mrr || 0), 0),
        setup: acc.setup + (curr.salesDetails || []).reduce((a, s) => a + (s.setupFee || 0), 0),
      }), { leads: 0, appointments: 0, presentations: 0, sales: 0, mrr: 0, setup: 0 });
  };

  const getMonthlyTotal = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return lapsHistory
      .filter(d => d.date >= startOfMonth.toISOString().split('T')[0] && d.date <= todayStr)
      .reduce((acc, curr) => ({
        leads: acc.leads + curr.leads,
        appointments: acc.appointments + curr.appointments,
        presentations: acc.presentations + curr.presentations,
        sales: acc.sales + curr.sales,
        mrr: acc.mrr + (curr.salesDetails || []).reduce((a, s) => a + (s.mrr || 0), 0),
        setup: acc.setup + (curr.salesDetails || []).reduce((a, s) => a + (s.setupFee || 0), 0),
      }), { leads: 0, appointments: 0, presentations: 0, sales: 0, mrr: 0, setup: 0 });
  };

  const weeklyTotal = getWeeklyTotal();
  const monthlyTotal = getMonthlyTotal();

  // --- EXPORT (now includes salesDetails columns) ---
  const exportLapsData = () => {
    if (lapsHistory.length === 0) return alert("No laps data to export.");
    const headers = ['date', 'leads', 'appointments', 'presentations', 'sales',
      'outreach_emails', 'voice_drops', 'li_comments', 'li_posts', 'li_dms',
      'mrr_current', 'total_setup_fees', 'total_mrr_added'];
    const rows = lapsHistory.map(row => {
      const daySetup = (row.salesDetails || []).reduce((a, s) => a + (s.setupFee || 0), 0);
      const dayMrr = (row.salesDetails || []).reduce((a, s) => a + (s.mrr || 0), 0);
      return [row.date, row.leads, row.appointments, row.presentations, row.sales,
        row.outreach_emails || 0, row.voice_drops || 0, row.li_comments || 0,
        row.li_posts || 0, row.li_dms || 0, row.mrr_current || 0, daySetup, dayMrr].join(',');
    }).join('\n');
    const blob = new Blob([[headers.join(','), rows].join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laps-history.csv`;
    link.click();
  };

  const mrrGap = mrrTarget - (currentLaps.mrr_current || 0);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><ActivityIcon className="w-5 h-5 text-blue-600" /></div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">LAPS & Outreach Tracker</h2>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-sm">
          <TargetIcon className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Monthly MRR Target</p>
            <p className="text-lg font-black text-blue-700 leading-none mt-0.5">${mrrTarget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">

        {/* OUTREACH ACTIONS */}
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Outreach & Social Actions</h3>
        <p className="text-xs font-medium text-slate-500 mb-5 -mt-2 bg-slate-50 inline-block px-3 py-1 rounded-md border border-slate-100">These actions automatically sum into your total Lead count below.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { key: 'outreach_emails', label: 'Emails', target: DAILY_TARGETS.outreach_emails },
            { key: 'voice_drops', label: 'Voice Drops', target: 0 },
            { key: 'li_comments', label: 'LI Comm', target: DAILY_TARGETS.li_comments },
            { key: 'li_posts', label: 'LI Posts', target: DAILY_TARGETS.li_posts },
            { key: 'li_dms', label: 'LI DMs', target: DAILY_TARGETS.li_dms }
          ].map(item => (
            <div key={item.key} className={`p-4 rounded-2xl border transition-all ${currentLaps[item.key] >= item.target && item.target > 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200/60'}`}>
              <label htmlFor={item.key} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{item.label}</label>
              <input type="number" name={item.key} id={item.key} value={currentLaps[item.key] || 0} onChange={handleInputChange} className="block w-full rounded-xl border border-slate-200 bg-white shadow-sm p-2.5 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 transition-all" min="0" />
              {item.target > 0 && <p className="text-[10px] text-slate-400 font-bold bg-white/50 inline-block px-2 py-0.5 rounded">Target: {item.target}</p>}
            </div>
          ))}
        </div>

        {/* CORE CONVERSIONS */}
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-t border-slate-100 pt-8">Core Conversions ({todayStr})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['leads', 'appointments', 'presentations', 'sales'].map(key => (
            <div key={key} className={`p-4 rounded-2xl border transition-all ${
              key === 'leads' ? 'bg-blue-50/50 border-blue-200' :
              key === 'sales' && currentLaps.sales > 0 ? 'bg-emerald-50 border-emerald-200' :
              'bg-slate-50 border-slate-200/60'
            }`}>
              <label htmlFor={key} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                {key}
                {key === 'leads' && <span className="text-[9px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md font-black">AUTO</span>}
                {key === 'sales' && currentLaps.sales > 0 && <span className="text-[9px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md font-black">LOG BELOW ↓</span>}
              </label>
              <input type="number" name={key} id={key} value={(currentLaps as any)[key] || 0} onChange={handleInputChange} className="block w-full rounded-xl border border-slate-200 bg-white shadow-sm p-3 text-xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all" min="0" />
            </div>
          ))}
        </div>

        {/* VALUE-BASED SALES ENGINE — renders only when sales > 0 */}
        {currentLaps.sales > 0 && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Sale Details — Log Each Deal</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Setup Total</p>
                  <p className="text-lg font-black text-blue-700">${totalSetupToday.toLocaleString()}</p>
                </div>
                <div className="text-center bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MRR Added</p>
                  <p className="text-lg font-black text-emerald-600">${totalMrrAddedToday.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {syncedSalesDetails.map((sale, idx) => (
                <div key={sale.id} className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-700">{idx + 1}</div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sale #{idx + 1}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-1 w-full">
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Setup Fee (one-time)</label>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                        <span className="text-slate-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={sale.setupFee || 0}
                          onChange={e => handleSaleDetailChange(sale.id, 'setupFee', Number(e.target.value))}
                          className="bg-transparent w-full text-sm font-black text-slate-800 outline-none"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Monthly MRR Added</label>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
                        <span className="text-emerald-500 font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={sale.mrr || 0}
                          onChange={e => handleSaleDetailChange(sale.id, 'mrr', Number(e.target.value))}
                          className="bg-transparent w-full text-sm font-black text-emerald-700 outline-none"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MRR TRACKING CARD */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="relative z-10 w-full lg:w-auto text-center lg:text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current MRR (Portfolio)</p>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="text-3xl text-slate-500 font-light">$</span>
              <input type="number" name="mrr_current" value={currentLaps.mrr_current || 0} onChange={handleInputChange} className="bg-transparent border-b-2 border-slate-700 text-4xl font-black text-white w-36 focus:outline-none focus:border-blue-500 transition-colors text-center lg:text-left pb-1" min="0" />
            </div>
            {totalMrrAddedToday > 0 && (
              <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
                <span className="text-emerald-500">↑</span> +${totalMrrAddedToday.toLocaleString()} new MRR logged today
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-8 relative z-10 w-full lg:w-auto bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="text-center">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Set Target</label>
              <div className="flex items-center justify-center">
                <span className="text-xl font-bold text-green-400 mr-1">$</span>
                <input
                  type="number"
                  value={mrrTarget}
                  onChange={(e) => setMrrTarget(Number(e.target.value) || 0)}
                  className="bg-slate-900 rounded-lg border border-slate-700 text-xl font-bold text-green-400 w-28 p-1.5 text-center focus:outline-none focus:border-green-400 transition-colors"
                  min="0"
                />
              </div>
            </div>
            <div className="h-px w-full md:w-px md:h-12 bg-slate-700"></div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gap to Goal</p>
              <p className={`text-2xl font-black ${mrrGap <= 0 ? 'text-green-400' : 'text-amber-400'}`}>
                ${mrrGap > 0 ? mrrGap.toLocaleString() : '0 (Goal Met!)'}
              </p>
            </div>
          </div>

          <button onClick={handleSave} className={`w-full lg:w-auto relative z-10 px-8 py-4 rounded-2xl font-black tracking-widest uppercase text-sm transition-all shadow-lg active:scale-95 ${saveStatus === 'saved' ? 'bg-green-500 text-white shadow-green-900/50' : saveStatus === 'saving' ? 'bg-blue-400 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/50'}`} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saved' ? '✓ Data Saved' : saveStatus === 'saving' ? 'Saving...' : "Save Today's Data"}
          </button>
        </div>
      </div>

      {/* WEEKLY / MONTHLY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t border-slate-100 pt-8">
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUpIcon className="w-4 h-4 text-blue-500" /> This Week's Total</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Leads</span><span className="font-black text-slate-800 text-lg">{weeklyTotal.leads}</span></div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Appts</span><span className="font-black text-slate-800 text-lg">{weeklyTotal.appointments}</span></div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Pres</span><span className="font-black text-slate-800 text-lg">{weeklyTotal.presentations}</span></div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Sales</span><span className="font-black text-slate-800 text-lg">{weeklyTotal.sales}</span></div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex justify-between items-center col-span-2"><span className="text-emerald-600 font-medium">MRR Added</span><span className="font-black text-emerald-700 text-lg">${weeklyTotal.mrr.toLocaleString()}</span></div>
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex justify-between items-center col-span-2"><span className="text-blue-600 font-medium">Setup Fees</span><span className="font-black text-blue-700 text-lg">${weeklyTotal.setup.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUpIcon className="w-4 h-4 text-purple-500" /> This Month's Total</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Leads</span><span className="font-black text-slate-800 text-lg">{monthlyTotal.leads}</span></div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Appts</span><span className="font-black text-slate-800 text-lg">{monthlyTotal.appointments}</span></div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Pres</span><span className="font-black text-slate-800 text-lg">{monthlyTotal.presentations}</span></div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><span className="text-slate-500 font-medium">Sales</span><span className="font-black text-slate-800 text-lg">{monthlyTotal.sales}</span></div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm flex justify-between items-center col-span-2"><span className="text-emerald-600 font-medium">MRR Added</span><span className="font-black text-emerald-700 text-lg">${monthlyTotal.mrr.toLocaleString()}</span></div>
            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex justify-between items-center col-span-2"><span className="text-blue-600 font-medium">Setup Fees</span><span className="font-black text-blue-700 text-lg">${monthlyTotal.setup.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* HISTORY LOG */}
      <div className="border-t border-slate-100 pt-6">
        <button onClick={() => setShowHistory(!showHistory)} className="w-full flex justify-between items-center text-left focus:outline-none group">
          <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">LAPS History Log ({lapsHistory.length} days)</span>
          <ChevronDownIcon className={`w-5 h-5 text-slate-400 group-hover:text-blue-600 transform transition-all duration-300 ${showHistory ? 'rotate-180' : ''}`} />
        </button>
        {showHistory && (
          <div className="mt-6">
            <div className="flex justify-end mb-4">
              {lapsHistory.length > 0 && (
                <button onClick={exportLapsData} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all">
                  <DownloadIcon className="w-3.5 h-3.5" />Export CSV
                </button>
              )}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Leads</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Appts</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Pres</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Sales</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Setup $</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">MRR Added</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Portfolio MRR</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {lapsHistory.slice().reverse().map(day => {
                    const daySetup = (day.salesDetails || []).reduce((a, s) => a + (s.setupFee || 0), 0);
                    const dayMrr = (day.salesDetails || []).reduce((a, s) => a + (s.mrr || 0), 0);
                    return (
                      <tr key={day.date} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{new Date(day.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{day.leads}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{day.appointments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{day.presentations}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{day.sales}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{daySetup > 0 ? `$${daySetup.toLocaleString()}` : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{dayMrr > 0 ? `$${dayMrr.toLocaleString()}` : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">${day.mrr_current || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LapsTracker;
