import React from 'react';
import type { Task } from '../types'; // This line fixes the 'Task' error
import { CalendarIcon, DollarSignIcon } from './Icons';

interface NonNegotiableTaskItemProps { task: Task; onUpdate: (updatedTask: Task) => void; }

const NonNegotiableTaskItem: React.FC<NonNegotiableTaskItemProps> = ({ task, onUpdate }) => {
  const handleAddToCalendar = () => {
    if (!task.scheduledTime) return alert("Set a time first.");
    const [h, m] = task.scheduledTime.split(':').map(Number);
    const start = new Date(); start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + (task.duration || 60) * 60 * 1000);
    const toG = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${task.text}&dates=${toG(start)}/${toG(end)}&colorId=11`, '_blank');
  };

  return (
    <div className={`p-4 rounded-xl flex items-center gap-4 border ${task.isCompleted ? 'bg-slate-50 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
      <input type="checkbox" checked={task.isCompleted} onChange={e => onUpdate({...task, isCompleted: e.target.checked})} className="h-5 w-5 rounded text-blue-600" />
      <div className="flex-1"><p className={`font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.text}</p>
        {task.isIncomeGenerating && <span className="text-[10px] font-bold text-yellow-600 uppercase flex items-center gap-1 mt-0.5"><DollarSignIcon className="w-3 h-3" /> Income Activity</span>}
      </div>
      <div className="flex items-center gap-2">
        <input type="time" value={task.scheduledTime} onChange={e => onUpdate({...task, scheduledTime: e.target.value})} className="block w-28 text-sm p-2 rounded-lg border-slate-200 font-medium" />
        <button onClick={handleAddToCalendar} disabled={!task.scheduledTime} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600"><CalendarIcon className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

export const NonNegotiableTasks: React.FC<{ tasks: Task[], onUpdateTask: (t: Task) => void }> = ({ tasks, onUpdateTask }) => (
    <section className="space-y-3"><h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">🗓️ Daily Non-Negotiables</h2>
        {tasks.map(t => <NonNegotiableTaskItem key={t.id} task={t} onUpdate={onUpdateTask} />)}
    </section>
);
export default NonNegotiableTasks;