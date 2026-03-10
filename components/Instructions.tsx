import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';

const Instructions: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm mb-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-slate-700 focus:outline-none"
            >
                <span>Time Boxing Instructions & Tips</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-6 border-t border-slate-200 text-slate-700">
                    <p className="text-base mb-4">
                        Here's a ripper strategy to keep you focused and make sure you're raking in the cash. It's all about being intentional and focused on actions that drive real results for your business.
                    </p>
                    
                    <h4 className="font-semibold text-slate-800 text-lg mb-3">Step-by-Step Instructions</h4>
                    <ol className="list-decimal list-outside pl-5 space-y-3 mb-6">
                        <li>
                            <strong className="font-semibold text-slate-900">Brain Dump Everything You Need to Do:</strong> Grab a blank piece of paper and jot down absolutely all the tasks running through your head.
                            <em className="block text-sm text-slate-500 pl-2 border-l-2 border-slate-200 ml-2 mt-1 italic">Tip: This should be a fresh brain dump every single day.</em>
                        </li>
                        <li>
                            <strong className="font-semibold text-slate-900">Select Your Top Three Tasks:</strong> From your list, circle just three items to focus on. 
                            <em className="block text-sm text-slate-500 pl-2 border-l-2 border-slate-200 ml-2 mt-1 italic">Crucial Step: One of these three tasks must be a direct income-generating activity (e.g., talking to a customer, closing a deal, sending offers).</em>
                        </li>
                        <li>
                            <strong className="font-semibold text-slate-900">Schedule These Three Tasks:</strong> Book specific times in your calendar for each task. 
                            <em className="block text-sm text-slate-500 pl-2 border-l-2 border-slate-200 ml-2 mt-1 italic">Tip: This creates an appointment with yourself for accountability.</em>
                        </li>
                        <li>
                            <strong className="font-semibold text-slate-900">Detail Action Points for Each Task:</strong> In the notes for each scheduled task, create a bullet-point list of the specific actions required. 
                            <em className="block text-sm text-slate-500 pl-2 border-l-2 border-slate-200 ml-2 mt-1 italic">Tip: This pre-planning removes hesitation.</em>
                        </li>
                        <li>
                            <strong className="font-semibold text-slate-900">Execute Your Plan:</strong> When the time comes, show up and get it done. You learn by doing.
                        </li>
                    </ol>

                    <h4 className="font-semibold text-slate-800 text-lg mb-3">Key Tips for Success</h4>
                    <ul className="list-disc list-outside pl-5 space-y-2">
                        <li><strong className="font-semibold text-slate-900">Consistency is King:</strong> This exercise takes 3-5 minutes a day. Do it religiously.</li>
                        <li><strong className="font-semibold text-slate-900">Focus on Income-Generating Activities:</strong> Ask yourself: "Is what I'm doing right now putting cash in my bank today?".</li>
                        <li><strong className="font-semibold text-slate-900">Track Your Progress:</strong> Use the LAPS sheet (Leads, Appointments, Presentations, Sales) daily.</li>
                        <li><strong className="font-semibold text-slate-900">Dedicate Specific Time:</strong> Allocate at least one hour per day to these focused, income-generating actions.</li>
                        <li><strong className="font-semibold text-slate-900">Don't Overthink It:</strong> This is a "just do" moment. Action leads to clarity.</li>
                        <li><strong className="font-semibold text-slate-900">Learn by Doing:</strong> You get better by doing the work and getting feedback, not just by strategising.</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Instructions;