// FIX: Populated file with correct content and updated relative import paths.
import React from 'react';
// FIX: Updated import path for types.
import { Applicant, TeamMember, Stage } from '../../types';
import { ApplicantListItem } from './ApplicantListItem';
import { UsersIcon } from '../icons/UsersIcon';

interface MobileKanbanBoardProps {
  loading: boolean;
  applicants: Applicant[];
  teamMembers: TeamMember[];
  onCardClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onMoveClick: (applicant: Applicant) => void;
  onSendEmailClick: (applicant: Applicant) => void;
}

export const MobileKanbanBoard: React.FC<MobileKanbanBoardProps> = ({
  loading,
  applicants,
  teamMembers,
  onCardClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
  onSendEmailClick
}) => {
  if (loading) {
    return (
      <div className="flex-grow flex justify-center items-center p-8">
        <p className="text-gray-400">Loading applicants...</p>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-4 text-xl font-semibold text-white">No Applicants Found</h3>
        <p className="mt-2 text-gray-400">
          Try adjusting your filter or search terms.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-3">
      {applicants.map(applicant => (
        <ApplicantListItem
          key={applicant.id}
          applicant={applicant}
          teamMembers={teamMembers}
          onCardClick={onCardClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onMoveClick={onMoveClick}
          onSendEmailClick={onSendEmailClick}
        />
      ))}
    </div>
  );
};