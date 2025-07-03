import React, { useState } from 'react';
import { AccountabilityData } from '../types';

interface AccountabilityTrackerProps {
    accountabilityHistory: AccountabilityData[];
    setAccountabilityHistory: React.Dispatch<React.SetStateAction<AccountabilityData[]>>;
}

// Helper function to get dates for a specific week based on an offset from the current week
const getWeekDates = (weekOffset: number = 0) => {
    const weekDates: Date[] = [];
    const today = new Date();
    // Go to the requested week
    today.setDate(today.getDate() + weekOffset * 7);

    // Adjust to get Monday of that week
    const currentDay = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // If Sunday, go back 6 days.
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


const AccountabilityTracker: React.FC<AccountabilityTrackerProps> = ({ accountabilityHistory, setAccountabilityHistory }) => {
    const [weekOffset, setWeekOffset] = useState(0);

    const weekDates = getWeekDates(weekOffset);
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const activities: (keyof Omit<AccountabilityData, 'date'>)[] = ['appointment', 'spokeToPerson', 'taughtSomeone', 'madeOffer'];
    const activityLabels = {
        appointment: 'Appointment Y/N',
        spokeToPerson: 'Spoke to 1 person Y/N',
        taughtSomeone: 'Taught Someone Y/N',
        madeOffer: 'Made an offer Y/N',
    };

    const handleCheckboxChange = (date: string, activity: keyof Omit<AccountabilityData, 'date'>, checked: boolean) => {
        setAccountabilityHistory(prevHistory => {
            const entryIndex = prevHistory.findIndex(e => e.date === date);
            if (entryIndex > -1) {
                const newHistory = [...prevHistory];
                newHistory[entryIndex] = { ...newHistory[entryIndex], [activity]: checked };
                return newHistory;
            } else {
                const newEntry: AccountabilityData = {
                    date,
                    appointment: false,
                    spokeToPerson: false,
                    taughtSomeone: false,
                    madeOffer: false,
                    [activity]: checked
                };
                return [...prevHistory, newEntry];
            }
        });
    };

    const weekData = weekDates.map(date => {
        const dateStr = toISODateString(date);
        return accountabilityHistory.find(entry => entry.date === dateStr) || { 
            date: dateStr, 
            appointment: false,
            spokeToPerson: false,
            taughtSomeone: false,
            madeOffer: false 
        };
    });

    const totals = activities.reduce((acc, activity) => {
        acc[activity] = weekData.filter(day => day[activity]).length;
        return acc;
    }, {} as Record<keyof Omit<AccountabilityData, 'date'>, number>);

    const weekRange = `Week of ${toFriendlyDate(weekDates[0])} - ${toFriendlyDate(weekDates[4])}`;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Accountability Process</h2>
                    <p className="text-sm text-slate-500">{weekRange}</p>
                </div>
                <div className="flex gap-2">
                     <button
                        onClick={() => setWeekOffset(weekOffset - 1)}
                        className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                        ← Previous Week
                    </button>
                    <button
                        onClick={() => setWeekOffset(weekOffset + 1)}
                        disabled={weekOffset >= 0}
                        className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next Week →
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-300 text-sm">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="p-3 text-left font-semibold border-r border-blue-400">Activity</th>
                            {activities.map(activity => (
                                <th key={activity} className="p-3 text-center font-semibold border-r border-blue-400 last:border-r-0">{activityLabels[activity]}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weekDays.map((day, index) => {
                            const dateStr = toISODateString(weekDates[index]);
                            const dayData = weekData[index];
                            return (
                                <tr key={day} className="border-b border-slate-200">
                                    <td className="p-3 font-medium bg-slate-100 border-r border-slate-300 text-slate-900">{day}</td>
                                    {activities.map(activity => (
                                        <td key={activity} className="p-3 text-center border-r border-slate-300">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={!!dayData[activity as keyof typeof dayData]}
                                                onChange={e => handleCheckboxChange(dateStr, activity, e.target.checked)}
                                                aria-label={`${activityLabels[activity]} for ${day}`}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        <tr className="bg-blue-500 text-white font-bold">
                            <td className="p-3 border-r border-blue-400">Total</td>
                            {activities.map(activity => (
                                <td key={activity} className="p-3 text-center border-r border-blue-400 last:border-r-0">
                                    {totals[activity]}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountabilityTracker;
