import React from 'react';
import { Task } from '../types';
import { CalendarIcon } from './Icons';

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

    const toGoogleFormat = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const calendarUrl = new URL('https://www.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', task.text);
    calendarUrl.searchParams.append('dates', `${toGoogleFormat(startTime)}/${toGoogleFormat(endTime)}`);
    calendarUrl.searchParams.append('details', `Completing daily non-negotiable task: ${task.text}`);
    
    window.open(calendarUrl.toString() + '&colorId=11', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-3 rounded-lg flex items-center gap-4 bg-slate-50 border border-slate-200">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={(e) => handleToggle('isCompleted', e.target.checked)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
        aria-label={`Mark task '${task.text}' as complete`}
      />
      <div className="flex-1">
        <p className="font-medium text-slate-800">{task.text}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={task.scheduledTime}
          onChange={(e) => handleToggle('scheduledTime', e.target.value)}
          className="block w-32 text-sm p-2 rounded-md border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Scheduled time"
        />
        <button
          onClick={handleAddToCalendar}
          title="Add to Google Calendar"
          className="p-2 rounded-md bg-white border border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!task.scheduledTime}
          aria-label="Add to Google Calendar"
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
    <div className="space-y-3">
      {tasks.map(task => (
        <NonNegotiableTaskItem key={task.id} task={task} onUpdate={onUpdateTask} />
      ))}
    </div>
  );
};

export default NonNegotiableTasks;