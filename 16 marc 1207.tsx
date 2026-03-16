import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Task, LapsData, AccountabilityData } from './types';
import LapsTracker from './components/LapsTracker';
import AccountabilityTracker from './components/AccountabilityTracker';
import { 
  PlusIcon, TrashIcon, ArrowUpCircleIcon, ArrowDownCircleIcon,
  DownloadIcon, UploadIcon, RotateCcwIcon, LightbulbIcon,
  ChevronDownIcon, CalendarIcon, DollarSignIcon,
  EditIcon, ListTodoIcon, SparklesIcon, CommandIcon,
  LogOutIcon, CloudIcon, SearchIcon, HashIcon, TrendingUpIcon,
  TrophyIcon, TargetIcon
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; 
import { doc, setDoc, onSnapshot, writeBatch } from 'firebase/firestore';

// --- HELPERS ---
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

// --- CSV UTILITIES ---
const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const arrayToCSV = (array: any[]) => {
    if (!array || array.length === 0) return '';
    const headers = Object.keys(array[0]);
    const csvHeaders = headers.join(',');
    const csvRows = array.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
};

const exportCompletedTasks = (completedHistory: Task[]) => {
    if (!completedHistory || completedHistory.length === 0) { alert('No completed tasks to export'); return; }
    const tasksForExport = completedHistory.map(task => ({
      task: task.text, completed_date: new Date(task.completedAt!).toLocaleDateString(),
      completed_time: new Date(task.completedAt!).toLocaleTimeString(),
      was_income_generating: task.isIncomeGenerating ? 'Yes' : 'No',
      notes: task.notes || '', scheduled_time: task.scheduledTime || '', duration_minutes: task.duration || ''
    }));
    downloadCSV(arrayToCSV(tasksForExport), `completed-tasks-${new Date().toISOString().split('T')[0]}.csv`);
};

const exportAllData = (lapsHistory: any[], accountabilityHistory: any[], completedHistory: any[], brainDump: any[], topThree: any[], ideasVault: any[], dailyTodo: any[]) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let csvContent = '=== MOMENTUM TRACKER DATA EXPORT ===\n\n';
    if (lapsHistory.length > 0) { csvContent += '=== LAPS DATA ===\n'; csvContent += arrayToCSV(lapsHistory) + '\n\n'; }
    if (completedHistory.length > 0) {
      csvContent += '=== COMPLETED TASKS ===\n';
      csvContent += arrayToCSV(completedHistory.map(task => ({ task: task.text, completed_date: new Date(task.completedAt).toLocaleDateString(), was_income_generating: task.isIncomeGenerating ? 'Yes' : 'No', notes: task.notes || '' }))) + '\n\n';
    }
    downloadCSV(csvContent, `momentum-tracker-full-export-${timestamp}.csv`);
};

// --- COMPONENTS ---
const Instructions = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="bg-white rounded-2xl shadow-sm mb-8 border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-md">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 text-left text-lg font-bold text-slate-800 focus:outline-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <span className="flex items-center gap-2"><CommandIcon className="w-5 h-5 text-blue-600"/> Time Boxing Instructions & Tips</span>
          <ChevronDownIcon className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="p-6 border-t border-slate-100 text-slate-600 text-sm leading-relaxed bg-white">
            <ol className="list-decimal list-outside pl-5 space-y-3">
              <li><strong className="text-slate-800">Brain Dump Everything:</strong> Jot down all tasks running through your head. Fresh every day.</li>
              <li><strong className="text-slate-800">Select Your Top Three:</strong> Circle just three items. One MUST be income-generating.</li>
              <li><strong className="text-slate-800">Schedule These Three:</strong> Book specific times in your calendar.</li>
              <li><strong className="text-slate-800">Detail Action Points:</strong> Bullet-point the specific actions required for each.</li>
              <li><strong className="text-slate-800">Execute Your Plan:</strong> Show up and get it done. You learn by doing.</li>
            </ol>
          </div>
        )}
      </div>
    );
};

const TimePicker12Hour = ({ value, onChange, className }: { value: string, onChange: (v: string) => void, className?: string }) => {
    const convertTo12Hour = (time24: string) => {
      if (!time24) return { hour: '', minute: '', period: 'AM' };
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours);
      return { hour: (hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24).toString(), minute: minutes, period: hour24 >= 12 ? 'PM' : 'AM' };
    };
    const convertTo24Hour = (hour: string, minute: string, period: string) => {
      if (!hour || !minute) return '';
      let hour24 = parseInt(hour);
      if (period === 'AM' && hour24 === 12) hour24 = 0;
      else if (period === 'PM' && hour24 !== 12) hour24 += 12;
      return `${hour24.toString().padStart(2, '0')}:${minute}`;
    };
    const [timeData, setTimeData] = useState(() => convertTo12Hour(value));
    useEffect(() => { setTimeData(convertTo12Hour(value)); }, [value]);
    const handleTimeChange = (field: string, newValue: string) => {
      const updatedTime = { ...timeData, [field]: newValue };
      setTimeData(updatedTime);
      if (updatedTime.hour && updatedTime.minute) { const time24 = convertTo24Hour(updatedTime.hour, updatedTime.minute, updatedTime.period); if (time24) onChange(time24); }
    };
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <select value={timeData.hour} onChange={(e) => handleTimeChange('hour', e.target.value)} className="block w-[72px] text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer">
          <option value="">Hr</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (<option key={hour} value={hour}>{hour}</option>))}
        </select>
        <span className="text-slate-400 font-bold">:</span>
        <select value={timeData.minute} onChange={(e) => handleTimeChange('minute', e.target.value)} className="block w-[72px] text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer">
          <option value="">Min</option>{Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(minute => (<option key={minute} value={minute}>{minute}</option>))}
        </select>
        <select value={timeData.period} onChange={(e) => handleTimeChange('period', e.target.value)} className="block w-[72px] text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 cursor-pointer">
          <option value="AM">AM</option><option value="PM">PM</option>
        </select>
      </div>
    );
};

const TaskCard = ({ 
    task, 
    onUpdate, 
    onDelete, 
    onPromoteToDaily, 
    onPromoteToTop, 
    onDemoteToDaily, 
    onDemoteToDump, 
    onSendToVault, 
    isTopThree 
}: any) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    
    const [tempTitle, setTempTitle] = useState(task.text);
    const [tempDescription, setTempDescription] = useState(task.description || '');
    const [tempTags, setTempTags] = useState(task.tags?.join(', ') || '');

    const handleToggle = (field: string, value: any) => onUpdate({ ...task, [field]: value });

    const handleTitleEdit = () => {
      if (isEditingTitle) { if (tempTitle.trim()) onUpdate({ ...task, text: tempTitle.trim() }); else setTempTitle(task.text); setIsEditingTitle(false); }
      else { setTempTitle(task.text); setIsEditingTitle(true); }
    };

    const handleDescriptionEdit = () => {
      if (isEditingDescription) { onUpdate({ ...task, description: tempDescription }); setIsEditingDescription(false); }
      else { setTempDescription(task.description || ''); setIsEditingDescription(true); setShowDescription(true); }
    };

    const handleTagsEdit = () => {
        if (isEditingTags) { 
            const tagsArray = tempTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            onUpdate({ ...task, tags: tagsArray }); 
            setIsEditingTags(false); 
        } else { 
            setTempTags(task.tags?.join(', ') || ''); 
            setIsEditingTags(true); 
        }
    };

    const handleAddToCalendar = () => {
      if (!task.scheduledTime) { const calendarUrl = new URL('https://www.google.com/calendar/render'); calendarUrl.searchParams.append('action', 'TEMPLATE'); calendarUrl.searchParams.append('text', task.text); window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer'); return; }
      const [hours, minutes] = task.scheduledTime.split(':').map(Number);
      const startTime = new Date(); startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + (task.duration || 60) * 60 * 1000);
      const toGoogleFormat = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
      const calendarUrl = new URL('https://www.google.com/calendar/render');
      calendarUrl.searchParams.append('action', 'TEMPLATE');
      calendarUrl.searchParams.append('text', task.text);
      calendarUrl.searchParams.append('dates', `${toGoogleFormat(startTime)}/${toGoogleFormat(endTime)}`);
      calendarUrl.searchParams.append('details', task.notes || `Completing task: ${task.text}`);
      window.open(calendarUrl.toString(), '_blank', 'noopener,noreferrer');
    };

    return (
      <div className={`p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all duration-200 group hover:shadow-md hover:border-blue-200 ${task.isCompleted ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-4">
          <input type="checkbox" checked={task.isCompleted} onChange={(e) => handleToggle('isCompleted', e.target.checked)} className="mt-1 h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" />
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {isEditingTitle ? (
                  <input type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onBlur={handleTitleEdit} onKeyDown={(e) => { if (e.key === 'Enter') handleTitleEdit(); if (e.key === 'Escape') { setTempTitle(task.text); setIsEditingTitle(false); }}} className="flex-1 font-bold text-slate-800 bg-slate-50 border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              ) : (
                  <div className="flex-1">
                      <p className={`font-bold text-slate-800 text-[15px] ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>{task.text}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 mb-1">
                        {isEditingTags ? (
                            <input 
                                type="text" value={tempTags} onChange={(e) => setTempTags(e.target.value)} onBlur={handleTagsEdit} onKeyDown={(e) => e.key === 'Enter' && handleTagsEdit()}
                                placeholder="Add tags..."
                                className="text-[10px] px-2 py-0.5 rounded border border-blue-200 bg-blue-50 outline-none w-full"
                                autoFocus
                            />
                        ) : (
                            <>
                                {task.tags && task.tags.length > 0 ? (
                                    task.tags.map((tag: string, idx: number) => (
                                        <span key={idx} className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black rounded-md uppercase tracking-wider">#{tag}</span>
                                    ))
                                ) : (
                                    <button onClick={() => setIsEditingTags(true)} className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1"><HashIcon className="w-3 h-3" /> Add Tags</button>
                                )}
                                <button onClick={() => setIsEditingTags(true)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon className="w-3 h-3 text-slate-300 hover:text-blue-600" /></button>
                            </>
                        )}
                      </div>
                  </div>
              )}
              <button onClick={handleTitleEdit} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"><EditIcon className="w-4 h-4" /></button>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowDescription(!showDescription)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                  <ChevronDownIcon className={`w-3.5 h-3.5 transform transition-transform ${showDescription ? 'rotate-180' : ''}`} />{task.description ? 'Show Description' : 'Add Description'}
                </button>
              </div>
              {showDescription && (
                <div className="mt-3">
                  {isEditingDescription || !task.description ? (
                    <div className="space-y-3">
                      <textarea value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} placeholder="Add specific details or notes..." className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]" autoFocus />
                      <div className="flex gap-2">
                        <button onClick={handleDescriptionEdit} className="px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">Save Notes</button>
                        <button onClick={() => { setTempDescription(task.description || ''); setIsEditingDescription(false); if(!task.description) setShowDescription(false); }} className="px-4 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl whitespace-pre-wrap relative group/desc">
                        {task.description}
                        <button onClick={() => setIsEditingDescription(true)} className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-blue-600 rounded-md shadow-sm border border-slate-100 opacity-0 group-hover/desc:opacity-100 transition-all"><EditIcon className="w-3.5 h-3.5"/></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isTopThree && (
          <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TimePicker12Hour value={task.scheduledTime || ''} onChange={(time) => handleToggle('scheduledTime', time)} className="w-full" />
              <select value={task.duration || 60} onChange={(e) => handleToggle('duration', Number(e.target.value))} className="block w-full text-xs font-medium p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 cursor-pointer">
                <option value="15">15 mins block</option><option value="30">30 mins block</option><option value="45">45 mins block</option><option value="60">1 hour block</option><option value="90">1.5 hours block</option>
              </select>
            </div>
            
            <button onClick={handleAddToCalendar} className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
              <CalendarIcon className="w-4 h-4" /><span>{task.scheduledTime ? 'Add Block to Calendar' : 'Open Calendar'}</span>
            </button>
            
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Action Points & Outcomes</label>
                <textarea placeholder="What defines 'done' for this task?" value={task.notes || ''} onChange={(e) => handleToggle('notes', e.target.value)} rows={2} className="block w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            
            <button 
              onClick={() => handleToggle('isIncomeGenerating', !task.isIncomeGenerating)} 
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${task.isIncomeGenerating ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
            >
              <DollarSignIcon className="w-4 h-4" /><span>Income-Generating Activity</span>
            </button>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-wrap items-center gap-1.5">
            {onPromoteToDaily && <button onClick={onPromoteToDaily} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors"><ArrowUpCircleIcon className="w-3.5 h-3.5" />To Daily</button>}
            {onPromoteToTop && <button onClick={onPromoteToTop} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md hover:bg-emerald-100 hover:border-emerald-200 transition-colors"><ArrowUpCircleIcon className="w-3.5 h-3.5" />To Top 3</button>}
            {onDemoteToDaily && <button onClick={onDemoteToDaily} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors"><ArrowDownCircleIcon className="w-3.5 h-3.5" />To Daily</button>}
            {onDemoteToDump && <button onClick={onDemoteToDump} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors"><ArrowDownCircleIcon className="w-3.5 h-3.5" />To Dump</button>}
            {onSendToVault && <button onClick={onSendToVault} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-100 rounded-md hover:bg-purple-100 hover:border-purple-200 transition-colors"><LightbulbIcon className="w-3.5 h-3.5" />To Vault</button>}
          </div>
          <button onClick={onDelete} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors"><TrashIcon className="w-3.5 h-3.5" />Delete</button>
        </div>
      </div>
    );
};

const NonNegotiableTasks = ({ tasks, onUpdateTask }: any) => {
    return (
      <div className="space-y-3">
        {tasks.map((task: any) => (
          <div key={task.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                  <input type="checkbox" checked={task.isCompleted} onChange={(e) => onUpdateTask({ ...task, isCompleted: e.target.checked })} className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <p className={`font-bold text-slate-800 text-sm ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>{task.text}</p>
              </div>
              <TimePicker12Hour value={task.scheduledTime || ''} onChange={(time) => onUpdateTask({ ...task, scheduledTime: time })} className="flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // -- DATA STATE --
    const [brainDump, setBrainDump] = useState<Task[]>([]);
    const [dailyTodo, setDailyTodo] = useState<Task[]>([]);
    const [topThree, setTopThree] = useState<Task[]>([]);
    const [completedHistory, setCompletedHistory] = useState<Task[]>([]);
    const [ideasVault, setIdeasVault] = useState<Task[]>([]);
    const [lapsHistory, setLapsHistory] = useState<LapsData[]>([]);
    const [accountabilityHistory, setAccountabilityHistory] = useState<AccountabilityData[]>([]);
    
    const NON_NEGOTIABLE_TASKS_BASE = [
        { id: 'nn-prospecting', text: 'Prospecting Block', isIncomeGenerating: true, duration: 60 },
        { id: 'nn-linkedin', text: 'LinkedIn Content & Engagement', isIncomeGenerating: false, duration: 60 },
    ];
    const [nonNegotiableTasks, setNonNegotiableTasks] = useState<Task[]>(NON_NEGOTIABLE_TASKS_BASE.map(task => ({ ...task, isCompleted: false, scheduledTime: '', notes: '', description: '', source: 'manual' })));
    
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskTags, setNewTaskTags] = useState('');
    
    const [showCompleted, setShowCompleted] = useState(false);
    const [showIdeasVault, setShowIdeasVault] = useState(false);
    const [showBrainDumpList, setShowBrainDumpList] = useState(true);
    
    const [tagSearch, setTagSearch] = useState(''); 
    const [dailyTagSearch, setDailyTagSearch] = useState(''); 
    const [vaultSearch, setVaultSearch] = useState('');

    const [isAIPrioritizing, setIsAIPrioritizing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedBrainDumpIds, setSelectedBrainDumpIds] = useState<Set<string>>(new Set());
    const importFileRef = useRef<HTMLInputElement>(null);

    // --- WEEKLY MOMENTUM AGGREGATOR ---
    const weeklyStats = useMemo(() => {
        const last7Days = accountabilityHistory.slice(-7);
        const streak = last7Days.filter(day => day.appointment || day.spokeToPerson || day.taughtSomeone || day.madeOffer).length;
        const totalLeads = lapsHistory.slice(-7).reduce((acc, curr) => acc + (curr.leads || 0), 0);
        const totalSales = lapsHistory.slice(-7).reduce((acc, curr) => acc + (curr.sales || 0), 0);
        const igTasksRemaining = [...topThree, ...dailyTodo].filter(t => !t.isCompleted && t.isIncomeGenerating).length;
        return { streak, totalLeads, totalSales, igTasksRemaining };
    }, [accountabilityHistory, lapsHistory, topThree, dailyTodo]);

    // --- AUTH & SYNC LOGIC ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = () => signInWithPopup(auth, googleProvider);
    const logout = () => signOut(auth);

    useEffect(() => {
        if (!user) return;
        const syncKeys = [
            { key: 'timeboxing-brainDump', setter: setBrainDump },
            { key: 'timeboxing-ideasVault', setter: setIdeasVault },
            { key: 'lapsHistory', setter: setLapsHistory },
            { key: 'accountability-history', setter: setAccountabilityHistory },
            { key: `timeboxing-dailyTodo_${todayStr}`, setter: setDailyTodo },
            { key: `timeboxing-topThree_${todayStr}`, setter: setTopThree },
            { key: `timeboxing-nonNegotiable_${todayStr}`, setter: setNonNegotiableTasks },
            { key: 'timeboxing-completedHistory', setter: setCompletedHistory }
        ];

        const unsubscribers = syncKeys.map(({ key, setter }) => {
            return onSnapshot(doc(db, 'users', user.uid, 'appData', key), (docSnap) => {
                if (docSnap.exists()) setter(docSnap.data().value || []);
            });
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user, todayStr]);

    const cloudUpdate = async (key: string, value: any) => {
        if (!user) return;
        try { await setDoc(doc(db, 'users', user.uid, 'appData', key), { value }); } 
        catch (e) { console.error("Cloud Sync Error:", e); }
    };

    const restoreFromBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                const batch = writeBatch(db);
                Object.entries(data).forEach(([key, value]) => {
                    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                    batch.set(doc(db, 'users', user.uid, 'appData', key), { value: parsedValue });
                });
                await batch.commit();
                alert("Cloud Migration Successful!");
            } catch (err) { alert("Migration failed. Ensure the JSON format is correct."); }
        };
        reader.readAsText(file);
    };

    // --- CSV LOGIC ---
    const escapeCsvField = (field: string) => { if (/[",\n\r]/.test(field)) return `"${field.replace(/"/g, '""')}"`; return field; };
    const parseCSV = (text: string) => {
        const rows = [];
        for (const line of text.split(/\r?\n/)) {
          if (!line.trim()) continue;
          const fields = []; let current = ''; let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { fields.push(current); current = ''; }
            else current += ch;
          }
          fields.push(current); rows.push(fields);
        }
        return rows;
    };
    const handleToggleSelectMode = () => { setIsSelectMode(v => !v); setSelectedBrainDumpIds(new Set()); };
    const handleToggleSelectId = (id: string) => { setSelectedBrainDumpIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); };
    const handleSelectAll = () => { if (selectedBrainDumpIds.size === brainDump.length) setSelectedBrainDumpIds(new Set()); else setSelectedBrainDumpIds(new Set(brainDump.map(t => t.id))); };
    const handleExportCSV = () => {
        const tasks = selectedBrainDumpIds.size > 0 ? brainDump.filter(t => selectedBrainDumpIds.has(t.id)) : brainDump;
        const headers = ['Task Name','Notes','Scheduled Time (HH:MM)','Duration (mins)','Income Generating (true/false)'];
        const rows = tasks.map(t => [escapeCsvField(t.text||''),escapeCsvField(t.notes||''),escapeCsvField(t.scheduledTime||''),String(t.duration||''),String(t.isIncomeGenerating)].join(','));
        downloadCSV([headers.join(','),...rows].join('\n'), `brain-dump-${new Date().toISOString().split('T')[0]}.csv`);
    };
    const handleDownloadTemplate = () => {
        const headers = ['Task Name','Notes','Scheduled Time (HH:MM)','Duration (mins)','Income Generating (true/false)'];
        downloadCSV([headers.join(','),'Example Task 1,Some action points here,09:00,60,false','Example Task 2,Follow up with client,14:00,30,true'].join('\n'), 'brain-dump-template.csv');
    };
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (!ev.target) return;
          const rows = parseCSV(ev.target.result as string);
          if (rows.length < 2) { alert('CSV appears empty or only has headers.'); return; }
          const header = rows[0].map(h => h.trim().toLowerCase());
          const nameIdx=header.findIndex(h=>h.includes('task')), notesIdx=header.findIndex(h=>h.includes('notes')), timeIdx=header.findIndex(h=>h.includes('time')), durationIdx=header.findIndex(h=>h.includes('duration')), incomeIdx=header.findIndex(h=>h.includes('income'));
          const newTasks: Task[] = rows.slice(1).filter(row=>nameIdx>=0&&row[nameIdx]&&row[nameIdx].trim()).map(row=>({ id:generateUUID(), text:row[nameIdx].trim(), notes:notesIdx>=0?(row[notesIdx]||'').trim():'', scheduledTime:timeIdx>=0?(row[timeIdx]||'').trim():'', duration:durationIdx>=0?(parseInt(row[durationIdx])||60):60, isIncomeGenerating:incomeIdx>=0?(row[incomeIdx]||'').trim().toLowerCase()==='true':false, isCompleted:false, source: 'manual' }));
          if (newTasks.length===0) { alert('No valid tasks found.'); return; }
          const updated = [...newTasks, ...brainDump];
          setBrainDump(updated); cloudUpdate('timeboxing-brainDump', updated);
          alert(`Imported ${newTasks.length} tasks.`);
        };
        reader.readAsText(file); e.target.value='';
    };

    // --- TASK ACTIONS ---
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim() === '') return;
        const tagsArray = newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const newTask: Task = { 
            id: generateUUID(), text: newTaskText, description: newTaskDescription, tags: tagsArray,
            isCompleted: false, isIncomeGenerating: false, notes: '', scheduledTime: '', duration: 60, source: 'manual' 
        };
        const updated = [newTask, ...brainDump];
        setBrainDump(updated); cloudUpdate('timeboxing-brainDump', updated);
        setNewTaskText(''); setNewTaskDescription(''); setNewTaskTags('');
    };

    const handleUpdateTask = useCallback((updatedTask: Task) => {
        const taskLists = [
            { key: 'timeboxing-brainDump', state: brainDump, setter: setBrainDump },
            { key: `timeboxing-dailyTodo_${todayStr}`, state: dailyTodo, setter: setDailyTodo },
            { key: `timeboxing-topThree_${todayStr}`, state: topThree, setter: setTopThree }
        ];

        if (updatedTask.isCompleted) {
            const archived = { ...updatedTask, completedAt: new Date().toISOString() };
            const newHistory = [archived, ...completedHistory];
            setCompletedHistory(newHistory); cloudUpdate('timeboxing-completedHistory', newHistory);

            taskLists.forEach(({ key, state, setter }) => {
                const filtered = state.filter(t => t.id !== updatedTask.id);
                setter(filtered); cloudUpdate(key, filtered);
            });
        } else {
            taskLists.forEach(({ key, state, setter }) => {
                if (state.some(t => t.id === updatedTask.id)) {
                    const mapped = state.map(t => t.id === updatedTask.id ? updatedTask : t);
                    setter(mapped); cloudUpdate(key, mapped);
                }
            });
        }
    }, [brainDump, dailyTodo, topThree, completedHistory, todayStr]);

    const handleUpdateNonNegotiableTask = (updatedTask: Task) => {
        const updated = nonNegotiableTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        setNonNegotiableTasks(updated); cloudUpdate(`timeboxing-nonNegotiable_${todayStr}`, updated);
    };

    const handleUpdateVaultTask = (updatedTask: Task) => {
        const updated = ideasVault.map(t => t.id === updatedTask.id ? updatedTask : t);
        setIdeasVault(updated); cloudUpdate('timeboxing-ideasVault', updated);
    };

    const restoreTask = (id: string) => { 
        const taskToRestore = completedHistory.find(t => t.id === id); 
        if (taskToRestore) { 
            const newDump = [{ ...taskToRestore, isCompleted: false, completedAt: undefined }, ...brainDump];
            setBrainDump(newDump); cloudUpdate('timeboxing-brainDump', newDump);
            const newHistory = completedHistory.filter(t => t.id !== id);
            setCompletedHistory(newHistory); cloudUpdate('timeboxing-completedHistory', newHistory);
        } 
    };

    const handleDeleteTask = (id: string, currentList: Task[], key: string) => { 
        if (window.confirm("Delete this permanently?")) {
            const updated = currentList.filter(t => t.id !== id);
            cloudUpdate(key, updated);
        } 
    };

    // --- PIPELINE LOGIC ---
    const promoteToDailyFromDump = (id: string) => { const t = brainDump.find(x => x.id === id); if (t) { const nd = [t, ...dailyTodo]; setDailyTodo(nd); cloudUpdate(`timeboxing-dailyTodo_${todayStr}`, nd); const nb = brainDump.filter(x => x.id !== id); setBrainDump(nb); cloudUpdate('timeboxing-brainDump', nb); } };
    const promoteToTopFromDump = (id: string) => { if (topThree.length >= 3) return alert("Only 3!"); const t = brainDump.find(x => x.id === id); if (t) { const nt = [...topThree, t]; setTopThree(nt); cloudUpdate(`timeboxing-topThree_${todayStr}`, nt); const nb = brainDump.filter(x => x.id !== id); setBrainDump(nb); cloudUpdate('timeboxing-brainDump', nb); } };
    const promoteToTopFromDaily = (id: string) => { if (topThree.length >= 3) return alert("Only 3!"); const t = dailyTodo.find(x => x.id === id); if (t) { const nt = [...topThree, t]; setTopThree(nt); cloudUpdate(`timeboxing-topThree_${todayStr}`, nt); const nd = dailyTodo.filter(x => x.id !== id); setDailyTodo(nd); cloudUpdate(`timeboxing-dailyTodo_${todayStr}`, nd); } };
    const demoteToDailyFromTop = (id: string) => { const t = topThree.find(x => x.id === id); if (t) { const nd = [t, ...dailyTodo]; setDailyTodo(nd); cloudUpdate(`timeboxing-dailyTodo_${todayStr}`, nd); const nt = topThree.filter(x => x.id !== id); setTopThree(nt); cloudUpdate(`timeboxing-topThree_${todayStr}`, nt); } };
    const demoteToDumpFromTop = (id: string) => { const t = topThree.find(x => x.id === id); if (t) { const nb = [t, ...brainDump]; setBrainDump(nb); cloudUpdate('timeboxing-brainDump', nb); const nt = topThree.filter(x => x.id !== id); setTopThree(nt); cloudUpdate(`timeboxing-topThree_${todayStr}`, nt); } };
    const demoteToDumpFromDaily = (id: string) => { const t = dailyTodo.find(x => x.id === id); if (t) { const nb = [t, ...brainDump]; setBrainDump(nb); cloudUpdate('timeboxing-brainDump', nb); const nd = dailyTodo.filter(x => x.id !== id); setDailyTodo(nd); cloudUpdate(`timeboxing-dailyTodo_${todayStr}`, nd); } };
    const handleSendToVault = (id: string) => { const t = brainDump.find(x => x.id === id); if (t) { const nv = [t, ...ideasVault]; setIdeasVault(nv); cloudUpdate('timeboxing-ideasVault', nv); const nb = brainDump.filter(x => x.id !== id); setBrainDump(nb); cloudUpdate('timeboxing-brainDump', nb); } };
    const handleCopyFromVault = (id: string) => { const t = ideasVault.find(x => x.id === id); if (t) { const nb = [{ ...t, id: generateUUID(), isCompleted: false }, ...brainDump]; setBrainDump(nb); cloudUpdate('timeboxing-brainDump', nb); alert("Copied to Brain Dump!"); } };

    // --- AI PRIORITIZE ---
    const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL as string | undefined;
    const handleAIPrioritize = async () => {
        if (!MAKE_WEBHOOK_URL) { setAiError('Webhook URL not configured.'); return; }
        const incompleteTasks = brainDump.filter(t => !t.isCompleted);
        if (incompleteTasks.length === 0) { setAiError('Your Brain Dump is empty.'); return; }
        setIsAIPrioritizing(true); setAiError(null);
        try {
            const response = await fetch(MAKE_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks: incompleteTasks }) });
            if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
            const data = await response.json() as { dailyTodo?: Task[]; topThree?: Task[] };
            if (data.dailyTodo) { setDailyTodo(data.dailyTodo); cloudUpdate(`timeboxing-dailyTodo_${todayStr}`, data.dailyTodo); }
            if (data.topThree) { setTopThree(data.topThree); cloudUpdate(`timeboxing-topThree_${todayStr}`, data.topThree); }
        } catch (err) { setAiError(`AI Prioritize failed.`); } finally { setIsAIPrioritizing(false); }
    };

    const startNewDay = () => {
        if (window.confirm("End the day? Incomplete tasks return to Brain Dump.")) {
          const incomplete = [...topThree.filter(t => !t.isCompleted), ...dailyTodo.filter(t => !t.isCompleted)];
          if (incomplete.length > 0) {
            const stripped = incomplete.map(t => ({ ...t, scheduledTime: '', notes: '', isIncomeGenerating: false }));
            const newDump = [...stripped, ...brainDump];
            setBrainDump(newDump); cloudUpdate('timeboxing-brainDump', newDump);
          }
          setTopThree([]); cloudUpdate(`timeboxing-topThree_${todayStr}`, []);
          setDailyTodo([]); cloudUpdate(`timeboxing-dailyTodo_${todayStr}`, []);
          setTimeout(() => window.location.reload(), 100);
        }
    };

    // --- FILTERS ---
    const filteredBrainDump = brainDump.filter((t: Task) => tagSearch === '' || (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(tagSearch.toLowerCase()))));
    const filteredDailyTodo = dailyTodo.filter((t: Task) => dailyTagSearch === '' || (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(dailyTagSearch.toLowerCase()))));
    const filteredVault = ideasVault.filter((idea: Task) => 
        idea.text.toLowerCase().includes(vaultSearch.toLowerCase()) || 
        (idea.tags && idea.tags.some((tag: string) => tag.toLowerCase().includes(vaultSearch.toLowerCase())))
    );

    if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-blue-600">LOADING MOMENTUM...</div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
                    <SparklesIcon className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-slate-900 mb-8">PTP Momentum</h1>
                    <button onClick={login} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Sign In with Google</button>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-800 selection:bg-blue-100">
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/80 transition-all">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">PTP <span className="text-blue-600 font-light">Momentum</span></h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-4 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                 <img src={user.photoURL || ''} alt="user" className="w-6 h-6 rounded-full" />
                 <span className="text-xs font-bold text-slate-700">{user.displayName}</span>
                 <button onClick={logout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors"><LogOutIcon className="w-4 h-4" /></button>
              </div>
              <button onClick={() => exportAllData(lapsHistory, accountabilityHistory, completedHistory, brainDump, topThree, ideasVault, dailyTodo)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"><DownloadIcon className="w-4 h-4" />Backup OS</button>
              <button onClick={startNewDay} className="px-5 py-2.5 text-xs font-black tracking-wide uppercase text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-md">End Day</button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Instructions />

          {/* WEEKLY MOMENTUM SUMMARY CARD */}
          <section className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700"></div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/20 rounded-lg"><TrendingUpIcon className="w-5 h-5 text-blue-400" /></div>
                <h2 className="text-xl font-black text-white tracking-tight">Weekly Momentum</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">IG Streak (7d)</p>
                    <div className="flex items-center gap-2">
                        <TrophyIcon className={`w-5 h-5 ${weeklyStats.streak >= 5 ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-2xl font-black text-white">{weeklyStats.streak}/7</span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Leads</p>
                    <div className="flex items-center gap-2">
                        <TargetIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-2xl font-black text-white">{weeklyStats.totalLeads}</span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Sales</p>
                    <div className="flex items-center gap-2">
                        <DollarSignIcon className="w-5 h-5 text-emerald-400" />
                        <span className="text-2xl font-black text-white">{weeklyStats.totalSales}</span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">IG Priorities Open</p>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-amber-500" />
                        <span className="text-2xl font-black text-white">{weeklyStats.igTasksRemaining}</span>
                    </div>
                </div>
            </div>
          </section>

          {/* TOP 3 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-lg"><SparklesIcon className="w-5 h-5 text-amber-500" /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Top 3 Non-Negotiables</h2>
            </div>
            <div className="space-y-4">
              {topThree.map(task => (<TaskCard key={task.id} task={task} onUpdate={handleUpdateTask} onDelete={() => handleDeleteTask(task.id, topThree, `timeboxing-topThree_${todayStr}`)} onDemoteToDaily={() => demoteToDailyFromTop(task.id)} onDemoteToDump={() => demoteToDumpFromTop(task.id)} isTopThree={true} />))}
              {topThree.length < 3 && Array.from({ length: 3 - topThree.length }).map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl border-2 border-dashed border-slate-200/60 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs font-bold text-slate-300">{i + 1 + topThree.length}</div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Empty Priority Slot</span>
                  </div>
              ))}
            </div>
          </section>

          {/* DAILY EXECUTION */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg"><ListTodoIcon className="w-5 h-5 text-blue-600" /></div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Daily Execution</h2>
                </div>
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Filter daily list..." 
                        value={dailyTagSearch}
                        onChange={e => setDailyTagSearch(e.target.value)}
                        className="w-full pl-4 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>
            {filteredDailyTodo.length > 0 ? (
                <div className="space-y-4">
                    {filteredDailyTodo.map(task => (
                        <TaskCard 
                            key={task.id} task={task} onUpdate={handleUpdateTask} 
                            onDelete={() => handleDeleteTask(task.id, dailyTodo, `timeboxing-dailyTodo_${todayStr}`)} 
                            onPromoteToTop={() => promoteToTopFromDaily(task.id)} onDemoteToDump={() => demoteToDumpFromDaily(task.id)}
                            isTopThree={false} 
                        />
                    ))}
                </div>
            ) : (
                <div className="py-8 bg-slate-50 rounded-2xl border border-slate-200/50 border-dashed text-center text-slate-400 text-sm">
                    Daily list clear. Promote tasks from the Brain Dump below.
                </div>
            )}
          </section>

          {/* SYSTEM HABITS */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg"><CalendarIcon className="w-5 h-5 text-indigo-600" /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">System Habits</h2>
            </div>
            <NonNegotiableTasks tasks={nonNegotiableTasks} onUpdateTask={handleUpdateNonNegotiableTask} />
          </section>

          {/* MASTER BRAIN DUMP */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 border-b border-slate-100 pb-6">
              <button onClick={() => setShowBrainDumpList(!showBrainDumpList)} className="flex items-center gap-3 group focus:outline-none">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors"><CommandIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" /></div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">Master Brain Dump</h2>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${showBrainDumpList ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
                <input 
                    type="text" placeholder="Search master list..." value={tagSearch} onChange={e => setTagSearch(e.target.value)}
                    className="flex-1 lg:flex-none lg:w-48 pl-4 pr-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                    onClick={handleAIPrioritize} disabled={isAIPrioritizing || brainDump.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md active:scale-95 transition-all"
                >
                    <SparklesIcon className="w-3.5 h-3.5" /> {isAIPrioritizing ? 'Thinking...' : 'AI Prioritize'}
                </button>
                <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all shadow-sm"><UploadIcon className="w-3.5 h-3.5" /> CSV</button>
                
                {/* MIGRATION ENGINE (RESTORING BACKUP.JSON TO CLOUD) */}
                <div className="relative">
                    <button onClick={() => document.getElementById('migrate-input')?.click()} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all shadow-sm">
                        <CloudIcon className="w-3.5 h-3.5" /> Migration
                    </button>
                    <input type="file" id="migrate-input" className="hidden" accept=".json" onChange={restoreFromBackupFile} />
                </div>

                {!isSelectMode ? (
                  <button onClick={handleToggleSelectMode} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md">Select</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border"><input type="checkbox" checked={brainDump.length > 0 && selectedBrainDumpIds.size === brainDump.length} onChange={handleSelectAll} className="h-4 w-4 text-blue-600" /> All</label>
                    <button onClick={handleExportCSV} disabled={selectedBrainDumpIds.size === 0} className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-md">Export</button>
                    <button onClick={handleToggleSelectMode} className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                  </div>
                )}
                <input type="file" ref={importFileRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
              </div>
            </div>
            
            {aiError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">{aiError}</div>}

            {/* CAPTURE FORM */}
            <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              <form onSubmit={handleAddTask} className="flex flex-col gap-4 relative z-10">
               <input 
                    type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Capture a thought, task, or idea..." 
                    className="w-full rounded-xl border border-blue-200 bg-white p-5 text-lg font-black text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm" 
                />
                <textarea 
                    value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} placeholder="Add details, links, or context (Optional)..." 
                    className="w-full rounded-xl border-none bg-slate-50/50 hover:bg-slate-50 p-4 text-sm font-medium outline-none focus:bg-white transition-all resize-none shadow-inner" rows={2} 
                />
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                      type="text" value={newTaskTags} onChange={(e) => setNewTaskTags(e.target.value)} placeholder="Add tags (e.g., content, admin)..." 
                      className="flex-grow rounded-xl border-none bg-slate-50/50 hover:bg-slate-50 p-4 text-sm font-medium outline-none focus:bg-white transition-all shadow-inner" 
                  />
                  <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 font-black tracking-wide uppercase text-xs active:scale-95 transition-all">
                      Capture
                  </button>
                </div>
              </form>
            </div>
            
            {showBrainDumpList && (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                  {filteredBrainDump.length > 0 ? filteredBrainDump.map(task => (
                    <div key={task.id} className="flex items-start gap-3">
                      {isSelectMode && <input type="checkbox" checked={selectedBrainDumpIds.has(task.id)} onChange={() => handleToggleSelectId(task.id)} className="mt-5 h-5 w-5 rounded-md text-blue-600 focus:ring-blue-500 cursor-pointer" />}
                      <div className="flex-1 min-w-0">
                          <TaskCard 
                              task={task} onUpdate={handleUpdateTask} onDelete={() => handleDeleteTask(task.id, brainDump, 'timeboxing-brainDump')} 
                              onPromoteToDaily={() => promoteToDailyFromDump(task.id)} onPromoteToTop={() => promoteToTopFromDump(task.id)}
                              onSendToVault={() => handleSendToVault(task.id)} isTopThree={false} 
                          />
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <CommandIcon className="w-12 h-12 mb-4 text-slate-200" />
                        <p className="text-sm font-medium">{tagSearch ? "No captures match tag." : "Brain dump is empty."}</p>
                    </div>
                  )}
                </div>
            )}
          </section>

          {/* THE VAULT */}
          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                <button onClick={() => setShowIdeasVault(!showIdeasVault)} className="flex items-center gap-3 text-xl font-black text-white tracking-tight focus:outline-none">
                    <div className="p-2 bg-purple-500/20 rounded-lg"><LightbulbIcon className="w-5 h-5 text-purple-400" /></div>
                    The Vault ({ideasVault.length})
                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${showIdeasVault ? 'rotate-180' : ''}`} />
                </button>
                <div className="relative w-full md:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" placeholder="Search Vault..." value={vaultSearch} onChange={(e) => setVaultSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                </div>
            </div>
            {showIdeasVault && (
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 relative z-10">
                {filteredVault.length > 0 ? filteredVault.map((idea) => (
                  <div key={idea.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 transition-all hover:bg-white/10">
                    <TaskCard 
                        task={idea} onUpdate={handleUpdateVaultTask} 
                        onDelete={() => handleDeleteTask(idea.id, ideasVault, 'timeboxing-ideasVault')} 
                        onDemoteToDump={() => handleCopyFromVault(idea.id)} isTopThree={false} 
                    />
                  </div>
                )) : <p className="text-slate-500 text-sm text-center py-4">Vault is empty or no tag matches.</p>}
              </div>
            )}
          </div>

          {/* COMPLETED HISTORY */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-6">
              <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center text-left focus:outline-none gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg"><RotateCcwIcon className="w-5 h-5 text-emerald-600" /></div>
                <span className="text-xl font-black text-slate-800 tracking-tight">Completed Log ({completedHistory.length})</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${showCompleted ? 'rotate-180' : ''}`} />
              </button>
              {completedHistory.length > 0 && <button onClick={() => exportCompletedTasks(completedHistory)} className="hidden md:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all shadow-sm"><DownloadIcon className="w-3.5 h-3.5" />Export Log</button>}
            </div>
            {showCompleted && completedHistory.length > 0 && (
              <div className="space-y-3">
                {completedHistory.slice(0, 15).map(task => (
                  <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                    <div>
                        <p className="font-bold text-slate-700 text-sm">{task.text}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(task.completedAt!).toLocaleString()}</p>
                    </div>
                    <button onClick={() => restoreTask(task.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><RotateCcwIcon className="w-3.5 h-3.5" />Undo</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRACKERS */}
          <LapsTracker lapsHistory={lapsHistory} setLapsHistory={(v) => { setLapsHistory(v); cloudUpdate('lapsHistory', v); }} />
          <AccountabilityTracker accountabilityHistory={accountabilityHistory} setAccountabilityHistory={(v) => { setAccountabilityHistory(v); cloudUpdate('accountability-history', v); }} lapsHistory={lapsHistory} />
        </main>
      </div>
    );
};

export default App;
