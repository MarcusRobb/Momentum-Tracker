import React, { useState, useCallback } from 'react';
import { Task, LapsData, AccountabilityData } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Instructions from './components/Instructions';
import LapsTracker from './components/LapsTracker';
import NonNegotiableTasks from './components/NonNegotiableTasks';
import AccountabilityTracker from './components/AccountabilityTracker';
import Reports from './components/Reports';
import GeminiModal from './components/GeminiModal';
import { PlusIcon, TrashIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, DollarSignIcon, CalendarIcon, RestoreIcon, ChevronDownIcon, LightbulbIcon, SparkleIcon, ChevronUpIcon } from './components/Icons';

const TaskCard: React.FC<{
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: () => void;
  onPromote?: () => void;
  onDemote?: () => void;
  onSendToVault?: () => void;
  onLaunchGemini?: () => void;
  isTopThree: boolean;
}> = ({ task, onUpdate, onDelete, onPromote, onDemote, onSendToVault, onLaunchGemini, isTopThree }) => {
  const handleToggle = (field: keyof Task, value: any) => {
    onUpdate({ ...task, [field]: value });
  };
  
  const handleAddToCalendar = () => {
    if (!task.scheduledTime || task.scheduledTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) === null) {
        alert("Please set a valid time for the task first.");
        return;
    }

    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    const durationMinutes = task.duration || 60;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const toGoogleFormat = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const calendarUrl = new URL('https://www.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', task.text);
    calendarUrl.searchParams.append('dates', `${toGoogleFormat(startTime)}/${toGoogleFormat(endTime)}`);
    calendarUrl.searchParams.append('details', task.notes || `Completing task: ${task.text}`);
    calendarUrl.searchParams.append('crm', 'BUSY');
    
    window.open(calendarUrl.toString() + '&colorId=11', '_blank', 'noopener,noreferrer');
  };


  return (
    <div className={`p-4 rounded-lg flex items-start gap-4 transition-all bg-white border border-slate-200`}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={(e) => handleToggle('isCompleted', e.target.checked)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Mark task as complete`}
      />
      <div className="flex-1">
        <p className="font-medium text-slate-800">{task.text}</p>
        {isTopThree && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
                 <input
                  type="time"
                  value={task.scheduledTime}
                  onChange={(e) => handleToggle('scheduledTime', e.target.value)}
                  className="block w-full text-sm p-2 rounded-md border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Scheduled time"
                />
                 <select
                    value={task.duration || 60}
                    onChange={(e) => handleToggle('duration', Number(e.target.value))}
                    className="block w-full text-sm p-2 rounded-md border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Task duration"
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
            </div>
             <button
                onClick={handleAddToCalendar}
                title="Add to Google Calendar"
                className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!task.scheduledTime}
                aria-label="Add to Google Calendar"
            >
                <CalendarIcon className="w-5 h-5" />
                <span>Add to Calendar</span>
            </button>
            <textarea
              placeholder="Action points & notes..."
              value={task.notes}
              onChange={(e) => handleToggle('notes', e.target.value)}
              rows={3}
              className="block w-full text-sm p-2 rounded-md border-slate-300 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Task notes"
            />
             <button
                onClick={() => handleToggle('isIncomeGenerating', !task.isIncomeGenerating)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  task.isIncomeGenerating ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                aria-pressed={task.isIncomeGenerating}
            >
                <DollarSignIcon className="w-4 h-4" />
                <span>Income-Generating Activity</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        {onPromote && <button onClick={onPromote} title="Promote to Top 3" className="text-slate-500 hover:text-green-600"><ArrowUpCircleIcon className="w-6 h-6" /></button>}
        {onDemote && <button onClick={onDemote} title="Demote to Brain Dump" className="text-slate-500 hover:text-yellow-600"><ArrowDownCircleIcon className="w-6 h-6" /></button>}
        {onSendToVault && <button onClick={onSendToVault} title="Send to Ideas Vault" className="text-slate-500 hover:text-purple-600"><LightbulbIcon className="w-5 h-5" /></button>}
        {onLaunchGemini && <button onClick={onLaunchGemini} title="Work with Gemini" className="text-slate-500 hover:text-blue-600"><SparkleIcon className="w-5 h-5" /></button>}
        <button onClick={onDelete} title="Delete Task" className="text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

const NON_NEGOTIABLE_TASKS_BASE: Omit<Task, 'isCompleted' | 'scheduledTime' | 'notes' | 'completedAt'>[] = [
  { id: 'nn-prospecting', text: 'Prospecting Min 1 hr', isIncomeGenerating: true, duration: 60 },
  { id: 'nn-linkedin', text: 'Linkedin Post and commenting Min 1 hr', isIncomeGenerating: false, duration: 60 },
];


const App: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [brainDump, setBrainDump] = useLocalStorage<Task[]>('timeboxing-brainDump', []);
  const [topThree, setTopThree] = useLocalStorage<Task[]>(`timeboxing-topThree_${todayStr}`, []);
  const [completedHistory, setCompletedHistory] = useLocalStorage<Task[]>('timeboxing-completedHistory', []);
  const [ideasVault, setIdeasVault] = useLocalStorage<Task[]>('timeboxing-ideasVault', []);
  
  const [lapsHistory, setLapsHistory] = useLocalStorage<LapsData[]>('lapsHistory', []);
  const [accountabilityHistory, setAccountabilityHistory] = useLocalStorage<AccountabilityData[]>('accountability-history', []);
  
  const [nonNegotiableTasks, setNonNegotiableTasks] = useLocalStorage<Task[]>(
      `timeboxing-nonNegotiable_${todayStr}`,
      NON_NEGOTIABLE_TASKS_BASE.map(task => ({
        ...task,
        isCompleted: false,
        scheduledTime: '',
        notes: '', // required by type
      }))
    );

  const [newTaskText, setNewTaskText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showIdeasVault, setShowIdeasVault] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [geminiTask, setGeminiTask] = useState<Task | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      isCompleted: false,
      isIncomeGenerating: false,
      notes: '',
      scheduledTime: '',
      duration: 60,
    };
    setBrainDump(prev => [newTask, ...prev]);
    setNewTaskText('');
  };

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    if (updatedTask.isCompleted) {
        const taskToArchive = { ...updatedTask, completedAt: new Date().toISOString() };
        setCompletedHistory(prev => [taskToArchive, ...prev]);
        setBrainDump(prev => prev.filter(t => t.id !== updatedTask.id));
        setTopThree(prev => prev.filter(t => t.id !== updatedTask.id));
    } else {
        setBrainDump(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setTopThree(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }
  }, [setBrainDump, setTopThree, setCompletedHistory]);

  const handleUpdateNonNegotiableTask = useCallback((updatedTask: Task) => {
      setNonNegotiableTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, [setNonNegotiableTasks]);

  const handleDeleteTask = (id: string, listSetter: React.Dispatch<React.SetStateAction<Task[]>>) => {
      if (window.confirm("Are you sure you want to permanently delete this item?")) {
        listSetter(prev => prev.filter(t => t.id !== id));
      }
  };

  const promoteTask = (id: string) => {
    if (topThree.length >= 3) {
      alert("You can only have 3 top tasks. Demote one first.");
      return;
    }
    const taskToPromote = brainDump.find(t => t.id === id);
    if (taskToPromote) {
        setTopThree(prev => [...prev, taskToPromote]);
        setBrainDump(prev => prev.filter(t => t.id !== id));
    }
  };

  const demoteTask = (id: string) => {
    const taskToDemote = topThree.find(t => t.id === id);
    if (taskToDemote) {
        setBrainDump(prev => [taskToDemote, ...prev]);
        setTopThree(prev => prev.filter(t => t.id !== id));
    }
  };
  
  const restoreTask = (id: string) => {
      const taskToRestore = completedHistory.find(t => t.id === id);
      if (taskToRestore) {
          const restoredTask = { ...taskToRestore, isCompleted: false, completedAt: undefined };
          setBrainDump(prev => [restoredTask, ...prev]);
          setCompletedHistory(prev => prev.filter(t => t.id !== id));
      }
  };
  
  const handleSendToVault = (id: string) => {
    const taskToVault = brainDump.find(t => t.id === id);
    if (taskToVault) {
      setIdeasVault(prev => [taskToVault, ...prev]);
      setBrainDump(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleCopyFromVault = (id: string) => {
    const taskToCopy = ideasVault.find(t => t.id === id);
    if (taskToCopy) {
      const newActionableTask = { ...taskToCopy, id: crypto.randomUUID() };
      setBrainDump(prev => [newActionableTask, ...prev]);
      alert(`Copied "${taskToCopy.text}" to Brain Dump.`);
    }
  };

  const handleReorderIdea = (id: string, direction: 'up' | 'down') => {
      setIdeasVault(prev => {
          const index = prev.findIndex(t => t.id === id);
          if (index === -1) return prev;

          if (direction === 'up' && index > 0) {
              const newVault = [...prev];
              [newVault[index - 1], newVault[index]] = [newVault[index], newVault[index - 1]];
              return newVault;
          }
          if (direction === 'down' && index < prev.length - 1) {
              const newVault = [...prev];
              [newVault[index + 1], newVault[index]] = [newVault[index], newVault[index + 1]];
              return newVault;
          }
          return prev;
      });
  };

  const startNewDay = () => {
    if (window.confirm("Are you sure you want to end the day? Incomplete priorities will be returned to your Brain Dump.")) {
        const incompleteTasks = topThree.filter(t => !t.isCompleted);
        const tasksToDemote = incompleteTasks.map(t => ({...t, scheduledTime: '', notes: ''}));
        setBrainDump(prev => [...prev, ...tasksToDemote]);
        window.location.reload();
    }
  };
  
  const dayOfWeek = new Date().getDay(); // 0 = Sun, 6 = Sat
  const isWeekday = dayOfWeek > 0 && dayOfWeek < 6;

  const handleLaunchGemini = (task: Task) => setGeminiTask(task);
  const handleCloseGemini = () => setGeminiTask(null);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">Momentum Tracker</h1>
          </div>
          <button 
            onClick={startNewDay}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Start New Day
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Instructions />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col gap-8">
              <section aria-labelledby="top-3-heading" className="bg-white p-6 rounded-lg shadow-md">
                  <h2 id="top-3-heading" className="text-2xl font-bold text-slate-800 mb-4">⭐ Top 3 Priorities</h2>
                  <div className="space-y-4">
                      {topThree.length > 0 ? (
                          topThree.map(task => (
                              <TaskCard 
                                  key={task.id} 
                                  task={task} 
                                  onUpdate={handleUpdateTask} 
                                  onDelete={() => handleDeleteTask(task.id, setTopThree)}
                                  onDemote={() => demoteTask(task.id)}
                                  onLaunchGemini={() => handleLaunchGemini(task)}
                                  isTopThree={true}
                              />
                          ))
                      ) : (
                          <p className="text-slate-500 text-center py-4">Promote tasks from your brain dump to focus on them.</p>
                      )}
                       {topThree.length < 3 && Array.from({ length: 3 - topThree.length }).map((_, i) => (
                          <div key={i} className="p-4 rounded-lg border-2 border-dashed border-slate-300 text-center text-slate-400" aria-hidden="true">
                             Empty Priority Slot
                          </div>
                      ))}
                  </div>
              </section>

              {isWeekday && (
                <section aria-labelledby="non-negotiable-heading" className="bg-white p-6 rounded-lg shadow-md">
                  <h2 id="non-negotiable-heading" className="text-2xl font-bold text-slate-800 mb-4">🗓️ Daily Non-Negotiables</h2>
                  <NonNegotiableTasks
                    tasks={nonNegotiableTasks}
                    onUpdateTask={handleUpdateNonNegotiableTask}
                  />
                </section>
              )}
            </div>
            
            <section aria-labelledby="brain-dump-heading" className="bg-white p-6 rounded-lg shadow-md">
                <h2 id="brain-dump-heading" className="text-2xl font-bold text-slate-800 mb-4">🧠 Brain Dump</h2>
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-grow block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                        aria-label="New task input"
                    />
                    <button type="submit" aria-label="Add new task" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center justify-center">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </form>
                <div className="space-y-3 max-h-[45rem] overflow-y-auto pr-2">
                    {brainDump.length > 0 ? (
                        brainDump.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                onUpdate={handleUpdateTask} 
                                onDelete={() => handleDeleteTask(task.id, setBrainDump)}
                                onPromote={() => promoteTask(task.id)}
                                onSendToVault={() => handleSendToVault(task.id)}
                                onLaunchGemini={() => handleLaunchGemini(task)}
                                isTopThree={false}
                            />
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">Brain dump all your tasks for the day here.</p>
                    )}
                </div>
            </section>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <button
                onClick={() => setShowIdeasVault(!showIdeasVault)}
                className="w-full flex justify-between items-center text-left text-xl font-bold text-slate-800 focus:outline-none"
            >
                <span>💡 Ideas Vault ({ideasVault.length})</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${showIdeasVault ? 'rotate-180' : ''}`} />
            </button>
            {showIdeasVault && (
                 <div className="mt-4 pt-4 border-t">
                    {ideasVault.length > 0 ? (
                        <div className="space-y-3">
                            {ideasVault.map((task, index) => (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <p className="text-slate-700">{task.text}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleReorderIdea(task.id, 'up')} disabled={index === 0} title="Move Up" className="p-1 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed">
                                                <ChevronUpIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleReorderIdea(task.id, 'down')} disabled={index === ideasVault.length - 1} title="Move Down" className="p-1 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed">
                                                <ChevronDownIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="h-6 border-l border-slate-300"></div>
                                        <button onClick={() => handleCopyFromVault(task.id)} title="Copy to Brain Dump" className="p-1 text-blue-600 hover:text-blue-800">
                                            <RestoreIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteTask(task.id, setIdeasVault)} title="Delete Idea Permanently" className="p-1 text-red-600 hover:text-red-800">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Send ideas here to review later.</p>
                    )}
                 </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex justify-between items-center text-left text-xl font-bold text-slate-800 focus:outline-none"
            >
                <span>✅ Completed Task History ({completedHistory.length})</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
            </button>
            {showCompleted && completedHistory.length > 0 && (
                 <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Task</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Completed At</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {completedHistory.map(task => (
                                <tr key={task.id}>
                                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-slate-900">{task.text}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(task.completedAt!).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                       <div className="flex items-center gap-4">
                                            <button onClick={() => restoreTask(task.id)} title="Restore Task" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                <RestoreIcon className="w-4 h-4" />
                                                <span>Restore</span>
                                            </button>
                                            <button onClick={() => handleDeleteTask(task.id, setCompletedHistory)} title="Delete Task Permanently" className="text-red-600 hover:text-red-800 flex items-center gap-1">
                                                <TrashIcon className="w-4 h-4" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            )}
             {showCompleted && completedHistory.length === 0 && (
                <p className="mt-4 text-slate-500 text-center py-4">No completed tasks yet. Get to work!</p>
            )}
        </div>

        <div className="mb-8">
            <LapsTracker lapsHistory={lapsHistory} setLapsHistory={setLapsHistory} />
        </div>

        <div className="mb-8">
            <AccountabilityTracker accountabilityHistory={accountabilityHistory} setAccountabilityHistory={setAccountabilityHistory} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
             <button
                onClick={() => setShowReports(!showReports)}
                className="w-full flex justify-between items-center text-left text-xl font-bold text-slate-800 focus:outline-none"
            >
                <span>📈 Performance Reports</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${showReports ? 'rotate-180' : ''}`} />
            </button>
            {showReports && (
                <div className="mt-6 border-t pt-6">
                     <Reports lapsHistory={lapsHistory} accountabilityHistory={accountabilityHistory} />
                </div>
            )}
        </div>

      </main>
      
      {geminiTask && <GeminiModal task={geminiTask} onClose={handleCloseGemini} />}
    </div>
  );
};

export default App;
