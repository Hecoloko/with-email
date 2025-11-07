import React from 'react';
import type { Applicant, Stage } from '../types';
import { STAGES } from '../constants';

import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ChatBubbleLeftIcon } from './icons/ChatBubbleLeftIcon';

interface DashboardProps {
  applicants: Applicant[];
  onNavigateToStage: (stage: Stage) => void;
}

const stageStyles: Record<Stage, { icon: React.ReactNode; color: string; bgColor: string }> = {
    Applied:   { icon: <ClipboardListIcon className="h-5 w-5" />, color: 'text-sky-400', bgColor: 'bg-sky-500/10' },
    Screening: { icon: <MagnifyingGlassIcon className="h-5 w-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    Interview: { icon: <UsersGroupIcon className="h-5 w-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    Offer:     { icon: <DocumentTextIcon className="h-5 w-5" />, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    Hired:     { icon: <CheckCircleIcon className="h-5 w-5" />, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    Rejected:  { icon: <XCircleIcon className="h-5 w-5" />, color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

const SummaryCard: React.FC<{
  stage: Stage;
  count: number;
  onClick: () => void;
}> = ({ stage, count, onClick }) => {
  const { icon, color, bgColor } = stageStyles[stage];
  
  return (
    <button
      onClick={onClick}
      className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-700/50 flex flex-col items-start justify-between gap-2 hover:border-accent-purple hover:bg-zinc-800/50 transition-all duration-200"
    >
      <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
          {icon}
      </div>
      <div>
        <span className="text-2xl font-bold text-white">{count}</span>
        <span className="block text-xs font-medium text-gray-400 mt-1">{stage}</span>
      </div>
    </button>
  );
};

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30.44);
  const years = Math.round(days / 365.25);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};


export const Dashboard: React.FC<DashboardProps> = ({ applicants, onNavigateToStage }) => {
  const applicantCounts = STAGES.reduce((acc, stage) => {
    acc[stage] = applicants.filter(app => app.stage === stage).length;
    return acc;
  }, {} as Record<Stage, number>);
  
  const totalApplicants = applicants.length;

  const recentNotes = applicants
    .flatMap(app => 
      (app.notes || []).map(note => ({
        ...note,
        applicantName: app.name,
        applicantAvatar: app.avatar_url,
      }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 space-y-8">
      <div>
        <div className='mb-6'>
          <h2 className="text-2xl font-semibold text-white">Stats at a Glance</h2>
          <p className="mt-1 text-gray-400">
            Tracking <span className="font-bold text-white">{totalApplicants}</span> total applicants.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {STAGES.map(stage => (
            <SummaryCard
              key={stage}
              stage={stage}
              count={applicantCounts[stage]}
              onClick={() => onNavigateToStage(stage)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentNotes.length > 0 ? (
            recentNotes.map(note => (
              <div key={note.id} className="flex items-start gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <img src={note.applicantAvatar} alt={note.applicantName} className="w-8 h-8 rounded-full mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{note.applicantName}</span>
                  </p>
                   <p className="text-sm text-gray-400 mt-1 truncate">
                    "{note.content}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{timeAgo(note.created_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <ChatBubbleLeftIcon className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-2 text-sm text-gray-500">No recent notes found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};