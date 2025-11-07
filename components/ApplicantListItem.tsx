import React, { useState, useRef, useEffect } from 'react';
import { Applicant, TeamMember } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { MoreVertIcon } from './icons/MoreVertIcon';
import { SwitchHorizontalIcon } from './icons/SwitchHorizontalIcon';

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


interface ApplicantListItemProps {
  applicant: Applicant;
  teamMembers: TeamMember[];
  onCardClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onMoveClick: (applicant: Applicant) => void;
}

export const ApplicantListItem: React.FC<ApplicantListItemProps> = ({
  applicant,
  teamMembers,
  onCardClick,
  onEditClick,
  onDeleteClick,
  onMoveClick
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const assignedTo = teamMembers.find(tm => tm.id === applicant.assigned_to_id);
  const openTasks = applicant.tasks?.filter(t => t.status !== 'Done').length || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(applicant);
    setMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(applicant.id);
    setMenuOpen(false);
  };

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveClick(applicant);
    setMenuOpen(false);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(prev => !prev);
  }

  return (
    <div
      onClick={() => onCardClick(applicant)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full hover:border-indigo-400 transition-colors cursor-pointer"
    >
        <div className="flex items-center">
            <img src={applicant.avatar_url} alt={applicant.name} className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-grow mx-4 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{applicant.name}</h4>
                <p className="text-sm text-gray-500 truncate">{applicant.role}</p>
                <div className="flex items-center flex-wrap gap-2 text-xs mt-2">
                    {openTasks > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full" title={`${openTasks} open tasks`}>
                        <TaskIcon />
                        <span>{openTasks}</span>
                        </div>
                    )}
                    {applicant.interview_date && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full" title={`Interview on ${new Date(applicant.interview_date).toLocaleString()}`}>
                        <CalendarIcon />
                        <span>Scheduled</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                {assignedTo && (
                    <img
                        src={assignedTo.avatar_url}
                        alt={assignedTo.name}
                        title={`Assigned to ${assignedTo.name}`}
                        className="w-8 h-8 rounded-full ring-2 ring-white"
                    />
                )}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={handleMenuToggle}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Actions"
                    >
                        <MoreVertIcon className="h-5 w-5"/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            <button onClick={handleMoveClick} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <SwitchHorizontalIcon className="h-4 w-4" /> Change Stage
                            </button>
                             <div className="border-t border-gray-100"></div>
                            <button onClick={handleEditClick} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={handleDeleteClick} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <TrashIcon className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};