import React, { useState, useRef, useEffect } from 'react';
import { Applicant, Stage, TeamMember } from '../../types';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { MoreVertIcon } from '../icons/MoreVertIcon';
import { SwitchHorizontalIcon } from '../icons/SwitchHorizontalIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';

const stageStyles: Record<Stage, string> = {
    Applied: 'bg-sky-500/10 text-sky-400',
    Screening: 'bg-purple-500/10 text-purple-400',
    Interview: 'bg-blue-500/10 text-blue-400',
    Offer: 'bg-amber-500/10 text-amber-400',
    Hired: 'bg-green-500/10 text-green-400',
    Rejected: 'bg-red-500/10 text-red-400',
};

interface ApplicantListItemProps {
  applicant: Applicant;
  teamMembers: TeamMember[];
  onCardClick: (applicant: Applicant) => void;
  onEditClick: (applicant: Applicant) => void;
  onDeleteClick: (applicantId: string) => void;
  onMoveClick: (applicant: Applicant) => void;
  onSendEmailClick: (applicant: Applicant) => void;
}

export const ApplicantListItem: React.FC<ApplicantListItemProps> = ({
  applicant,
  teamMembers,
  onCardClick,
  onEditClick,
  onDeleteClick,
  onMoveClick,
  onSendEmailClick
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const assignedTo = teamMembers.find(tm => tm.id === applicant.assigned_to_id);
  const emailCount = applicant.notes?.filter(n => n.content.startsWith('[Manual Email Sent]')).length || 0;

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
  
  const handleSendEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSendEmailClick(applicant);
    setMenuOpen(false);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(prev => !prev);
  }

  return (
    <div
      onClick={() => onCardClick(applicant)}
      className="bg-zinc-800 p-3 rounded-2xl shadow-lg shadow-black/30 border border-zinc-700 w-full hover:border-accent-purple transition-colors cursor-pointer"
    >
        <div className="flex items-center">
            <img src={applicant.avatar_url} alt={applicant.name} className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-grow mx-4 min-w-0">
                <h4 className="font-semibold text-white truncate">{applicant.name}</h4>
                <p className="text-sm text-gray-400 truncate">{applicant.role}</p>
                 <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${stageStyles[applicant.stage]}`}>
                        {applicant.stage}
                    </span>
                    {emailCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400" title={`${emailCount} email(s) sent`}>
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{emailCount}</span>
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
                        className="w-8 h-8 rounded-full ring-2 ring-zinc-800"
                    />
                )}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={handleMenuToggle}
                        className="p-2 text-gray-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors"
                        aria-label="Actions"
                    >
                        <MoreVertIcon className="h-5 w-5"/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 w-48 bg-zinc-700 rounded-lg shadow-lg border border-zinc-600 z-10">
                            <button onClick={handleSendEmailClick} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-zinc-600">
                                <EnvelopeIcon className="h-4 w-4" /> Send Email
                            </button>
                             <div className="border-t border-zinc-600"></div>
                            <button onClick={handleMoveClick} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-zinc-600">
                                <SwitchHorizontalIcon className="h-4 w-4" /> Change Stage
                            </button>
                             <div className="border-t border-zinc-600"></div>
                            <button onClick={handleEditClick} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-zinc-600">
                                <PencilIcon className="h-4 w-4" /> Edit Details
                            </button>
                            <button onClick={handleDeleteClick} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                                <TrashIcon className="h-4 w-4" /> Delete Applicant
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};