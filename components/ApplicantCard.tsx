import React from 'react';
import { Applicant, TeamMember } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

const TaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface ApplicantCardProps {
  applicant: Applicant;
  teamMembers: TeamMember[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void;
  onClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onSendEmailClick: (applicant: Applicant) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  teamMembers,
  onDragStart,
  onClick,
  onEditClick,
  onDeleteClick,
  onSendEmailClick,
}) => {
  const assignedTo = teamMembers.find(tm => tm.id === applicant.assigned_to_id);
  const openTasks = applicant.tasks?.filter(t => t.status !== 'Done').length || 0;
  const emailCount = applicant.notes?.filter(n => n.content.startsWith('[Manual Email Sent]')).length || 0;
  const latestNote =
    applicant.notes && applicant.notes.length > 0
      ? [...applicant.notes].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(applicant);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(applicant.id);
  };

  const handleSendEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSendEmailClick(applicant);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest('[data-no-drag="true"]')) {
          e.preventDefault();
          return;
        }
        onDragStart(e, applicant.id);
      }}
      className="bg-zinc-800 p-4 rounded-2xl shadow-lg shadow-black/30 border border-zinc-700 mb-4 cursor-grab hover:shadow-accent-purple/20 hover:border-accent-purple transition-all active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <div 
          onClick={() => onClick(applicant)}
          className="flex items-start gap-3 select-none cursor-pointer flex-grow"
        >
          <img src={applicant.avatar_url} alt={applicant.name} className="w-10 h-10 rounded-full" />
          <div>
            <h4 className="font-semibold text-white">{applicant.name}</h4>
            <p className="text-sm text-gray-400">{applicant.role}</p>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0 relative z-10 gap-1 ml-2">
          <button
            type="button"
            data-no-drag="true"
            draggable={false}
            onClickCapture={handleSendEmailClick}
            onPointerDown={(e) => { e.stopPropagation(); }}
            className="text-gray-400 hover:text-green-400 p-1 rounded-full hover:bg-zinc-700 transition-colors"
            aria-label={`Send email to ${applicant.name}`}
            title={`Send email to ${applicant.name}`}
          >
            <EnvelopeIcon className="h-4 w-4 pointer-events-none" />
          </button>
          <button
            type="button"
            data-no-drag="true"
            draggable={false}
            onClickCapture={handleEditClick}
            onPointerDown={(e) => { e.stopPropagation(); }}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-zinc-700 transition-colors"
            aria-label={`Edit ${applicant.name}`}
            title={`Edit ${applicant.name}`}
          >
            <PencilIcon className="h-4 w-4 pointer-events-none" />
          </button>
          <button
            type="button"
            data-no-drag="true"
            draggable={false}
            onClickCapture={handleDeleteClick}
            onPointerDown={(e) => { e.stopPropagation(); }}
            className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-zinc-700 transition-colors"
            aria-label={`Delete ${applicant.name}`}
            title={`Delete ${applicant.name}`}
          >
            <TrashIcon className="h-4 w-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {latestNote && (
        <p className="mt-3 text-sm text-gray-300 italic bg-zinc-900/80 p-2 rounded-md truncate" title={latestNote.content}>
          &quot;{latestNote.content}&quot;
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {openTasks > 0 && (
            <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full" title={`${openTasks} open tasks`}>
              <TaskIcon />
              <span>{openTasks}</span>
            </div>
          )}
          {applicant.interview_date && (
            <div className="flex items-center gap-1 bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full" title={`Interview on ${new Date(applicant.interview_date).toLocaleString()}`}>
              <CalendarIcon />
              <span>Scheduled</span>
            </div>
          )}
          {emailCount > 0 && (
             <div className="flex items-center gap-1 bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded-full" title={`${emailCount} email(s) sent`}>
              <EnvelopeIcon className="h-4 w-4" />
              <span>{emailCount}</span>
            </div>
          )}
        </div>
        {assignedTo && (
          <img
            src={assignedTo.avatar_url}
            alt={assignedTo.name}
            title={`Assigned to ${assignedTo.name}`}
            className="w-6 h-6 rounded-full ring-2 ring-zinc-900"
          />
        )}
      </div>
    </div>
  );
};