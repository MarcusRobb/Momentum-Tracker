import React from 'react';
import { Task } from '../types';
import { CalendarIcon, DollarSignIcon } from './Icons'; // Added DollarSignIcon here

interface NonNegotiableTaskItemProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

const NonNegotiableTaskItem: React.FC<NonNegotiableTaskItemProps> = ({ task, onUpdate }) => {

  const handleToggle = (field: keyof Task, value: any) => {
    onUpdate({ ...task, [field]: value });
  };
  
  const handleAddToCalendar = () => {
    if (!task.scheduledTime || !task.scheduledTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        alert("Please set a valid time for the task first.");
        return;
    }

    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);

    const durationMinutes = task.duration || 60;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const toGoogleFormat = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

    const calendarUrl = new URL('https://www.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', task.text);
    calendarUrl.searchParams.append('dates', `${toGoogleFormat(startTime)}/${toGoogleFormat(endTime)}`);
    calendarUrl.searchParams.append('details', `Daily Habit: ${task.text}`);
    
    window.open(calendarUrl.toString() + '&colorId=11', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`p-4 rounded-xl flex items-center gap-4 border transition-all ${
        task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={(e) => handleToggle('isCompleted', e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
      />
      <div className="flex-1">
        <p className={`font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.text}
        </p>
        {task.isIncomeGenerating && (
            <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <DollarSignIcon className="w-3 h-3" /> Income Activity
            </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={task.scheduledTime}
          onChange={(e) => handleToggle('scheduledTime', e.target.value)}
          className="block w-28 text-sm p-2 rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 font-medium"
        />
        <button
          onClick={handleAddToCalendar}
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-30"
          disabled={!task.scheduledTime}
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface NonNegotiableTasksProps {
  tasks: Task[];
  onUpdateTask: (updatedTask: Task) => void;
}

const NonNegotiableTasks: React.FC<NonNegotiableTasksProps> = ({ tasks, onUpdateTask }) => {
  return (
    <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">🗓️ Daily Non-Negotiables</h2>
        {tasks.map(task => (
            <NonNegotiableTaskItem key={task.id} task={task} onUpdate={onUpdateTask} />
        ))}
    </section>
  );
};

export default NonNegotiableTasks;