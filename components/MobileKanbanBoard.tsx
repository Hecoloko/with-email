import React from 'react';
import { Applicant, TeamMember, Stage } from '../types';
import { ApplicantListItem } from './ApplicantListItem';

interface MobileKanbanBoardProps {
  loading: boolean;
  applicants: Applicant[];
  teamMembers: TeamMember[];
  activeStage: Stage;
  onCardClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onMoveClick: (applicant: Applicant) => void;
}

export const MobileKanbanBoard: React.FC<MobileKanbanBoardProps> = ({
  loading,
  applicants,
  teamMembers,
  activeStage,
  onCardClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
}) => {
  if (loading) {
    return (
      <div className="flex-grow flex justify-center items-center p-8">
        <p className="text-gray-500">Loading applicants...</p>
      </div>
    );
  }

  const filteredApplicants = applicants.filter(a => a.stage === activeStage);

  if (filteredApplicants.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <h3 className="text-xl font-semibold text-gray-700">This stage is empty</h3>
        <p className="mt-2 text-gray-500">
          {applicants.length === 0 
            ? 'Add your first applicant to get started!' 
            : `No applicants currently in the "${activeStage}" stage.`}
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-3">
      {filteredApplicants.map(applicant => (
        <ApplicantListItem
          key={applicant.id}
          applicant={applicant}
          teamMembers={teamMembers}
          onCardClick={onCardClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onMoveClick={onMoveClick}
        />
      ))}
    </div>
  );
};
