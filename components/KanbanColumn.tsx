import React from 'react';
import { Applicant, Stage, TeamMember } from '../types';
import { ApplicantCard } from './ApplicantCard';

// Icons for each stage
const StageIcons: Record<Stage, React.FC<{className?: string}>> = {
    Applied: ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>),
    Screening: ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>),
    Interview: ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    Offer: ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    Hired: ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    Rejected: ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
};

const StageColors: Record<Stage, string> = {
    Applied: 'text-sky-400',
    Screening: 'text-purple-400',
    Interview: 'text-blue-400',
    Offer: 'text-amber-400',
    Hired: 'text-green-400',
    Rejected: 'text-red-400',
};

interface KanbanColumnProps {
  stage: Stage;
  applicants: Applicant[];
  teamMembers: TeamMember[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stage: Stage) => void;
  onCardClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onSendEmailClick: (applicant: Applicant) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, applicants, teamMembers, onDragStart, onDrop, onCardClick, onEditClick, onDeleteClick, onSendEmailClick }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const Icon = StageIcons[stage];

  return (
    <div
      onDrop={(e) => onDrop(e, stage)}
      onDragOver={handleDragOver}
      className="bg-zinc-900/50 rounded-2xl p-3 w-full md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 flex flex-col"
      style={{ minWidth: '300px' }}
    >
      <div className="flex-shrink-0 flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${StageColors[stage]}`} />
            <h3 className="font-bold text-lg text-white/90">{stage}</h3>
        </div>
        <span className="bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-full px-2 py-0.5">
          {applicants.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 no-scrollbar">
        {applicants.map(applicant => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            teamMembers={teamMembers}
            onDragStart={onDragStart}
            onClick={onCardClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onSendEmailClick={onSendEmailClick}
          />
        ))}
      </div>
    </div>
  );
};