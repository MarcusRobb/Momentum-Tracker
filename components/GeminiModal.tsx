import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { XIcon, SparkleIcon, ClipboardCopyIcon } from './Icons';

interface GeminiModalProps {
  task: Task;
  onClose: () => void;
}

const GeminiModal: React.FC<GeminiModalProps> = ({ task, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    // Focus the first focusable element when the modal opens
    const focusableElements = modalRef.current?.querySelectorAll('button, textarea');
    (focusableElements?.[0] as HTMLElement)?.focus();
    
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');
    setCopySuccess('');

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (err: any) {
        console.error("Failed to fetch from /api/gemini:", err);
        setError(err.message || 'Failed to get a response from the AI.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        responseRef.current?.scrollTo({ top: responseRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };
  
  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      aria-labelledby="gemini-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SparkleIcon className="w-6 h-6 text-blue-500" />
            <div>
                <h2 id="gemini-modal-title" className="text-lg font-semibold text-slate-800">AI Assistant</h2>
                <p className="text-sm text-slate-500 truncate" title={task.text}>Working on: "{task.text}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close AI assistant"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        <main ref={responseRef} className="flex-1 p-6 overflow-y-auto">
            {!response && !isLoading && !error && (
                <div className="text-center text-slate-400 py-16 animate-fade-in">
                    <p className="text-lg">What do you need help with?</p>
                    <p className="text-sm mt-1">e.g., "Brainstorm 5 marketing angles..."</p>
                </div>
            )}
            {isLoading && (
                <div className="flex items-center justify-center gap-3 text-slate-600 animate-fade-in">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span>Thinking...</span>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg animate-fade-in">
                    <p className="font-bold text-red-800">Error</p>
                    <p className="text-red-700">{error}</p>
                </div>
            )}
            {response && (
                <div className="prose prose-slate max-w-none relative animate-fade-in">
                    <button
                        onClick={handleCopyResponse}
                        className="absolute top-0 right-0 -mt-2 -mr-2 p-2 text-sm rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
                        aria-label="Copy AI response"
                    >
                        {copySuccess ? <>{copySuccess}</> : <><ClipboardCopyIcon className="w-4 h-4" /> Copy</>}
                    </button>
                   <pre className="whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-lg text-slate-800">{response}</pre>
                </div>
            )}
        </main>
        
        <footer className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-start gap-3">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Your request..."
              rows={2}
              className="flex-grow block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 resize-none"
              aria-label="Prompt for AI assistant"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                }
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 h-full bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isLoading || !prompt.trim()}
              aria-label="Send prompt to AI"
            >
              <SparkleIcon className="w-5 h-5" />
              <span>Send</span>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default GeminiModal;
