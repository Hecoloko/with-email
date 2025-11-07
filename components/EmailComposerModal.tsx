import React, { useState, useEffect } from 'react';
import { Applicant } from '../types';
import { generateCustomEmail, generateProfessionalFollowUpEmail } from './Gemini';
import { supabase } from '../supabaseClient';
import { sendEmail } from './communications';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface EmailComposerModalProps {
  applicant: Applicant;
  onClose: () => void;
}

type Status = 'idle' | 'generating' | 'sending' | 'success' | 'error';

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ applicant, onClose }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const generateInitialEmail = async () => {
      setStatus('generating');
      setMessage('');
      try {
        const result = await generateProfessionalFollowUpEmail(applicant);
        setSubject(result.subject);
        setBody(result.body);
        setStatus('idle');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Failed to automatically generate a draft email. Please write one manually or use the AI prompt.');
      }
    };
    if (applicant) {
      generateInitialEmail();
    }
  }, [applicant]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setStatus('generating');
    setMessage('');
    try {
      const result = await generateCustomEmail(applicant, aiPrompt);
      setSubject(result.subject);
      setBody(result.body);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setStatus('idle');
    }
  };

  const handleSend = async () => {
    if (!applicant.email) {
      setMessage("Applicant does not have an email address.");
      setStatus('error');
      return;
    }
    setStatus('sending');
    setMessage('');
    const result = await sendEmail(applicant.email, subject, body);
    if (result.success) {
      setStatus('success');
      setMessage('Email sent successfully!');
      await supabase.from('notes').insert({
        content: `[Manual Email Sent] Subject: "${subject}"`,
        applicant_id: applicant.id,
      });
      setTimeout(() => {
        // Refetch applicant data in parent to show new note
        onClose();
      }, 2000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed to send email.');
    }
  };

  const renderStatus = (status: Status, message: string) => {
    switch (status) {
        case 'generating':
            return (
                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl">
                    <svg className="animate-spin h-8 w-8 text-accent-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-white">Generating with AI...</p>
                </div>
            );
        case 'sending':
            return (
                 <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl">
                    <svg className="animate-spin h-8 w-8 text-accent-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 text-white">Sending Email...</p>
                </div>
            );
        case 'success':
            return (
                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl text-center p-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Success!</h3>
                    <p className="mt-2 text-gray-400">{message}</p>
                </div>
            );
        case 'error':
            return (
                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl text-center p-4">
                    <XCircleIcon className="h-12 w-12 text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Error</h3>
                    <p className="mt-2 text-gray-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{message}</p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="mt-4 bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            );
        default:
             return null;
    }
  }


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="relative bg-[#1A1A1D] w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-none md:shadow-2xl md:shadow-black/50 flex flex-col border border-zinc-700/50" onClick={e => e.stopPropagation()}>
        {renderStatus(status, message)}
        <header className="flex-shrink-0 flex justify-between items-start px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] md:p-6 border-b border-zinc-700">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Send Email</h2>
            <p className="text-sm text-gray-400">To: {applicant.name} &lt;{applicant.email || 'No Email'}&gt;</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto no-scrollbar space-y-4">
          <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-400 mb-2">Generate with AI</label>
            <div className="flex gap-2">
              <input
                id="ai-prompt"
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g., a friendly follow-up asking for availability"
                className="flex-grow bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:border-accent-purple focus:ring-accent-purple"
              />
              <button onClick={handleGenerate} disabled={status !== 'idle'} className="bg-accent-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">Generate</button>
            </div>
            {message && status === 'idle' && <p className="mt-2 text-sm text-red-400">{message}</p>}
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white focus:border-accent-purple focus:ring-accent-purple"
            />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-400 mb-1">Body</label>
            <textarea
              id="body"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg py-2 px-3 text-white focus:border-accent-purple focus:ring-accent-purple"
            />
          </div>
        </main>
        
        <footer className="flex-shrink-0 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:p-6 border-t border-zinc-700 bg-black/20 flex justify-end gap-3">
            <button onClick={onClose} type="button" className="bg-zinc-700 hover:bg-zinc-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSend} disabled={status !== 'idle' || !subject || !body} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">Send</button>
        </footer>
      </div>
    </div>
  );
};