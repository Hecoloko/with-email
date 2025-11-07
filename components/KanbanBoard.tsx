import React from 'react';
import { Applicant, Stage, TeamMember } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  applicants: Applicant[];
  stages: Stage[];
  teamMembers: TeamMember[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stage: Stage) => void;
  onCardClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onSendEmailClick: (applicant: Applicant) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ applicants, stages, teamMembers, onDragStart, onDrop, onCardClick, onEditClick, onDeleteClick, onSendEmailClick }) => {
  const showEmptyState = applicants.length === 0;

  return (
    <div className="h-full w-full flex flex-col relative">
      {showEmptyState && (
          <div className="absolute inset-0 flex justify-center items-center text-center pointer-events-none">
              <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Your board is empty</h3>
                  <p className="mt-2 text-gray-500">Click the "Add Applicant" button to get started!</p>
              </div>
          </div>
      )}

      <div className="flex-grow flex gap-6 overflow-x-auto">
        {stages.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applicants={applicants.filter(app => app.stage === stage)}
            teamMembers={teamMembers}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onCardClick={onCardClick}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onSendEmailClick={onSendEmailClick}
          />
        ))}
      </div>
    </div>
  );
};