import React from 'react';
import type { Stage } from '../../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: (Stage | 'All')[];
  activeStage: Stage | 'All';
  onSelectStage: (stage: Stage | 'All') => void;
  applicantCounts: Record<Stage | 'All', number>;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, stages, activeStage, onSelectStage, applicantCounts }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1A1D] w-full rounded-t-2xl shadow-2xl p-4 transform transition-transform duration-300 ease-in-out border-t border-zinc-700/50"
        onClick={e => e.stopPropagation()}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4"></div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Filter by Stage</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-2">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => onSelectStage(stage)}
              className={`w-full flex justify-between items-center p-3 rounded-lg text-left transition-colors ${
                activeStage === stage 
                ? 'bg-accent-purple text-white' 
                : 'text-gray-300 hover:bg-zinc-700'
              }`}
            >
              <span className="font-medium">{stage}</span>
              <span className={`text-sm font-semibold rounded-full px-2 py-0.5 ${
                activeStage === stage
                ? 'bg-white/20 text-white'
                : 'bg-zinc-700 text-zinc-200'
              }`}>
                {applicantCounts[stage] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
